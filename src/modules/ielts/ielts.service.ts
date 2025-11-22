import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IeltsTest,
  IeltsListening,
  IeltsListeningPart,
  IeltsReading,
  IeltsReadingPart,
  IeltsWriting,
  IeltsWritingTask,
  IeltsQuestion,
  IeltsAudio,
  User,
  ListeningPart,
  ReadingPart,
  WritingTask,
  WritingTaskType,
} from '../../entities';
import {
  CreateIeltsTestDto,
  UpdateIeltsTestDto,
  CreateListeningDto,
  CreateReadingDto,
  CreateWritingDto,
} from './dto/ielts-test.dto';

@Injectable()
export class IeltsService {
  constructor(
    @InjectRepository(IeltsTest)
    private ieltsTestRepository: Repository<IeltsTest>,
    @InjectRepository(IeltsListening)
    private listeningRepository: Repository<IeltsListening>,
    @InjectRepository(IeltsListeningPart)
    private listeningPartRepository: Repository<IeltsListeningPart>,
    @InjectRepository(IeltsReading)
    private readingRepository: Repository<IeltsReading>,
    @InjectRepository(IeltsReadingPart)
    private readingPartRepository: Repository<IeltsReadingPart>,
    @InjectRepository(IeltsWriting)
    private writingRepository: Repository<IeltsWriting>,
    @InjectRepository(IeltsWritingTask)
    private writingTaskRepository: Repository<IeltsWritingTask>,
    @InjectRepository(IeltsQuestion)
    private questionRepository: Repository<IeltsQuestion>,
    @InjectRepository(IeltsAudio)
    private audioRepository: Repository<IeltsAudio>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async getCenterIdFromUser(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['center_id'],
    });
    if (!user || !user.center_id) {
      throw new NotFoundException('User center not found');
    }
    return user.center_id;
  }

  // IELTS Test CRUD
  async createTest(
    createTestDto: CreateIeltsTestDto,
    userId: string,
    centerId: string,
  ): Promise<IeltsTest> {
    // Check if test already exists for this center
    const existingTest = await this.ieltsTestRepository.findOne({
      where: {
        title: createTestDto.title,
        center_id: centerId,
        is_active: true,
      },
    });

    if (existingTest) {
      // Update existing test
      Object.assign(existingTest, createTestDto);
      existingTest.updated_by = userId;
      return await this.ieltsTestRepository.save(existingTest);
    }

    // Create new test
    const test = this.ieltsTestRepository.create({
      ...createTestDto,
      center_id: centerId,
      created_by: userId,
    });
    return await this.ieltsTestRepository.save(test);
  }

  async getAllTests(centerId: string): Promise<IeltsTest[]> {
    return this.ieltsTestRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['listening', 'reading'],
      order: { created_at: 'DESC' },
    });
  }

  async getTestById(id: string, centerId: string): Promise<IeltsTest> {
    const test = await this.ieltsTestRepository.findOne({
      where: { id, center_id: centerId },
      relations: [
        'listening',
        'listening.parts',
        'listening.parts.question',
        'listening.parts.audio',
        'reading',
        'reading.parts',
        'reading.parts.question',
      ],
    });

    if (!test) {
      throw new NotFoundException(`IELTS Test with ID ${id} not found`);
    }

    return test;
  }

  async updateTest(
    id: string,
    updateTestDto: UpdateIeltsTestDto,
    userId: string,
    centerId: string,
  ): Promise<IeltsTest> {
    const test = await this.getTestById(id, centerId);
    Object.assign(test, updateTestDto);
    test.updated_by = userId;
    return await this.ieltsTestRepository.save(test);
  }

  async deleteTest(id: string, centerId: string): Promise<void> {
    const test = await this.getTestById(id, centerId);
    test.is_active = false;
    await this.ieltsTestRepository.save(test);
  }

  // Listening CRUD
  async createListening(
    createListeningDto: CreateListeningDto,
    userId: string,
    centerId: string,
  ): Promise<IeltsListening> {
    const { parts, test_id, ...listeningData } = createListeningDto;

    // Check if listening already exists for this test
    if (test_id) {
      const existingListening = await this.getListeningByTestId(
        test_id,
        centerId,
      );

      if (existingListening) {
        // Update existing listening - only update allowed fields
        if (listeningData.title) existingListening.title = listeningData.title;
        if (listeningData.description)
          existingListening.description = listeningData.description;
        if (listeningData.for_cdi !== undefined)
          existingListening.for_cdi = listeningData.for_cdi;
        existingListening.updated_by = userId;
        await this.listeningRepository.save(existingListening);

        // Delete old parts
        await this.listeningPartRepository.delete({
          listening_id: existingListening.id,
        });

        // Create new parts
        for (const partDto of parts) {
          let questionId: string;

          // Check if question_id exists in partDto (from existing data)
          if (partDto.question_id) {
            // Reuse existing question
            questionId = partDto.question_id;

            // Update question content if provided
            await this.questionRepository.update(questionId, {
              content: partDto.question.content,
              number_of_questions: partDto.question.number_of_questions,
            });
          } else {
            // Create new question
            const question = this.questionRepository.create({
              content: partDto.question.content,
              number_of_questions: partDto.question.number_of_questions,
              center_id: centerId,
            });
            const savedQuestion = await this.questionRepository.save(question);
            questionId = savedQuestion.id;
          }

          let audioId: string;

          // Check if audio_id exists in partDto (from existing data)
          if (partDto.audio_id) {
            // Reuse existing audio
            audioId = partDto.audio_id;

            // Update audio data if provided
            await this.audioRepository.update(audioId, {
              url: partDto.audio.url,
              file_name: partDto.audio.file_name,
              duration: partDto.audio.duration,
              file_size: partDto.audio.file_size,
            });
          } else {
            // Create new audio
            const audioData = {
              url: partDto.audio.url,
              file_name: partDto.audio.file_name,
              duration: partDto.audio.duration,
              file_size: partDto.audio.file_size,
              center_id: centerId,
              uploaded_by: userId,
            };
            const audio = this.audioRepository.create(audioData);
            const savedAudio = await this.audioRepository.save(audio);

            // Ensure we have the ID
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            audioId = Array.isArray(savedAudio)
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                savedAudio[0].id
              : savedAudio.id;
          }

          // Create part
          const part = this.listeningPartRepository.create({
            listening_id: existingListening.id,
            part: partDto.part as ListeningPart,
            question_id: questionId,
            audio_id: audioId,
            answers: partDto.answers || {},
          });
          await this.listeningPartRepository.save(part);
        }

        return await this.getListeningById(existingListening.id, centerId);
      }
    }

    // Create new listening
    const listening = this.listeningRepository.create({
      ...listeningData,
      test_id,
      center_id: centerId,
      created_by: userId,
    });
    const savedListening = await this.listeningRepository.save(listening);

    // Create parts
    for (const partDto of parts) {
      // Create question
      const question = this.questionRepository.create({
        content: partDto.question.content,
        number_of_questions: partDto.question.number_of_questions,
        center_id: centerId,
      });
      const savedQuestion = await this.questionRepository.save(question);

      // Create audio
      const audioData = {
        url: partDto.audio.url,
        file_name: partDto.audio.file_name,
        duration: partDto.audio.duration,
        file_size: partDto.audio.file_size,
        center_id: centerId,
        uploaded_by: userId,
      };
      const audio = this.audioRepository.create(audioData);
      const savedAudio = await this.audioRepository.save(audio);

      // Ensure we have the ID
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const audioId = Array.isArray(savedAudio)
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          savedAudio[0].id
        : savedAudio.id;

      // Create part
      const part = this.listeningPartRepository.create({
        listening_id: savedListening.id,
        part: partDto.part as ListeningPart,
        question_id: savedQuestion.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        audio_id: audioId,
        answers: partDto.answers || {},
      });
      await this.listeningPartRepository.save(part);
    }

    const result = await this.listeningRepository.findOne({
      where: { id: savedListening.id },
      relations: ['parts', 'parts.question', 'parts.audio'],
    });

    if (!result) {
      throw new NotFoundException('Failed to create listening test');
    }

    return result;
  }

  async getListeningById(
    id: string,
    centerId: string,
  ): Promise<IeltsListening> {
    const listening = await this.listeningRepository.findOne({
      where: { id, center_id: centerId },
      relations: ['parts', 'parts.question', 'parts.audio'],
    });

    if (!listening) {
      throw new NotFoundException(`Listening with ID ${id} not found`);
    }

    return listening;
  }

  async getAllListenings(centerId: string): Promise<IeltsListening[]> {
    return await this.listeningRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['parts'],
      order: { created_at: 'DESC' },
    });
  }

  async getListeningByTestId(
    testId: string,
    centerId: string,
  ): Promise<IeltsListening | null> {
    const listening = await this.listeningRepository.findOne({
      where: { test_id: testId, center_id: centerId, is_active: true },
      relations: ['parts', 'parts.question', 'parts.audio'],
    });

    return listening;
  }

  // Reading CRUD
  async createReading(
    createReadingDto: CreateReadingDto,
    userId: string,
    centerId: string,
  ): Promise<IeltsReading> {
    const { parts, test_id, ...readingData } = createReadingDto;

    // Check if reading already exists for this test
    if (test_id) {
      const existingReading = await this.getReadingByTestId(test_id, centerId);

      if (existingReading) {
        // Update existing reading - only update allowed fields
        if (readingData.title) existingReading.title = readingData.title;
        if (readingData.description)
          existingReading.description = readingData.description;
        if (readingData.for_cdi !== undefined)
          existingReading.for_cdi = readingData.for_cdi;
        existingReading.updated_by = userId;
        await this.readingRepository.save(existingReading);

        // Delete old parts
        await this.readingPartRepository.delete({
          reading_id: existingReading.id,
        });

        // Create new parts
        for (const partDto of parts) {
          let questionId: string;

          // Check if question_id exists in partDto (from existing data)
          if (partDto.question_id) {
            // Reuse existing question
            questionId = partDto.question_id;

            // Update question content if provided
            await this.questionRepository.update(questionId, {
              content: partDto.question.content,
              number_of_questions: partDto.question.number_of_questions,
            });
          } else {
            // Create new question
            const question = this.questionRepository.create({
              content: partDto.question.content,
              number_of_questions: partDto.question.number_of_questions,
              center_id: centerId,
            });
            const savedQuestion = await this.questionRepository.save(question);
            questionId = savedQuestion.id;
          }

          // Create part
          const part = this.readingPartRepository.create({
            reading_id: existingReading.id,
            part: partDto.part as ReadingPart,
            question_id: questionId,
            passage: partDto.passage,
            answers: partDto.answers || {},
          });
          await this.readingPartRepository.save(part);
        }

        return await this.getReadingById(existingReading.id, centerId);
      }
    }

    // Create new reading
    const reading = this.readingRepository.create({
      ...readingData,
      test_id,
      center_id: centerId,
      created_by: userId,
    });
    const savedReading = await this.readingRepository.save(reading);

    // Create parts
    for (const partDto of parts) {
      // Create question
      const question = this.questionRepository.create({
        content: partDto.question.content,
        number_of_questions: partDto.question.number_of_questions,
        center_id: centerId,
      });
      const savedQuestion = await this.questionRepository.save(question);

      // Create part
      const part = this.readingPartRepository.create({
        reading_id: savedReading.id,
        part: partDto.part as ReadingPart,
        question_id: savedQuestion.id,
        passage: partDto.passage,
        answers: partDto.answers || {},
      });
      await this.readingPartRepository.save(part);
    }

    const result = await this.readingRepository.findOne({
      where: { id: savedReading.id },
      relations: ['parts', 'parts.question'],
    });

    if (!result) {
      throw new NotFoundException('Failed to create reading test');
    }

    return result;
  }

  async getReadingById(id: string, centerId: string): Promise<IeltsReading> {
    const reading = await this.readingRepository.findOne({
      where: { id, center_id: centerId },
      relations: ['parts', 'parts.question'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    return reading;
  }

  async getAllReadings(centerId: string): Promise<IeltsReading[]> {
    return await this.readingRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['parts'],
      order: { created_at: 'DESC' },
    });
  }

  async getReadingByTestId(
    testId: string,
    centerId: string,
  ): Promise<IeltsReading | null> {
    const reading = await this.readingRepository.findOne({
      where: { test_id: testId, center_id: centerId, is_active: true },
      relations: ['parts', 'parts.question'],
    });

    return reading;
  }

  // Writing CRUD
  async createWriting(
    createWritingDto: CreateWritingDto,
    userId: string,
    centerId: string,
  ): Promise<IeltsWriting> {
    const { tasks, test_id, ...writingData } = createWritingDto;

    // Check if writing already exists for this test
    if (test_id) {
      const existingWriting = await this.getWritingByTestId(test_id, centerId);

      if (existingWriting) {
        // Update existing writing - only update allowed fields
        if (writingData.title) existingWriting.title = writingData.title;
        if (writingData.description)
          existingWriting.description = writingData.description;
        if (writingData.for_cdi !== undefined)
          existingWriting.for_cdi = writingData.for_cdi;
        existingWriting.updated_by = userId;
        await this.writingRepository.save(existingWriting);

        // Delete old tasks
        await this.writingTaskRepository.delete({
          writing_id: existingWriting.id,
        });

        // Create new tasks
        for (const taskDto of tasks) {
          const task = this.writingTaskRepository.create({
            writing_id: existingWriting.id,
            task: taskDto.task as WritingTask,
            task_type: taskDto.task_type as WritingTaskType,
            prompt: taskDto.prompt,
            visual_url: taskDto.visual_url,
            min_words:
              taskDto.min_words || (taskDto.task === 'TASK_1' ? 150 : 250),
            time_minutes:
              taskDto.time_minutes || (taskDto.task === 'TASK_1' ? 20 : 40),
            sample_answer: taskDto.sample_answer || {},
            assessment_criteria: taskDto.assessment_criteria || {},
          });
          await this.writingTaskRepository.save(task);
        }

        return await this.getWritingById(existingWriting.id, centerId);
      }
    }

    // Create new writing
    const writing = this.writingRepository.create({
      ...writingData,
      test_id,
      center_id: centerId,
      created_by: userId,
    });
    const savedWriting = await this.writingRepository.save(writing);

    // Create tasks
    for (const taskDto of tasks) {
      const task = this.writingTaskRepository.create({
        writing_id: savedWriting.id,
        task: taskDto.task as WritingTask,
        task_type: taskDto.task_type as WritingTaskType,
        prompt: taskDto.prompt,
        visual_url: taskDto.visual_url,
        min_words: taskDto.min_words || (taskDto.task === 'TASK_1' ? 150 : 250),
        time_minutes:
          taskDto.time_minutes || (taskDto.task === 'TASK_1' ? 20 : 40),
        sample_answer: taskDto.sample_answer || {},
        assessment_criteria: taskDto.assessment_criteria || {},
      });
      await this.writingTaskRepository.save(task);
    }

    const result = await this.writingRepository.findOne({
      where: { id: savedWriting.id },
      relations: ['tasks'],
    });

    if (!result) {
      throw new NotFoundException('Failed to create writing test');
    }

    return result;
  }

  async getWritingById(id: string, centerId: string): Promise<IeltsWriting> {
    const writing = await this.writingRepository.findOne({
      where: { id, center_id: centerId },
      relations: ['tasks'],
    });

    if (!writing) {
      throw new NotFoundException(`Writing with ID ${id} not found`);
    }

    return writing;
  }

  async getAllWritings(centerId: string): Promise<IeltsWriting[]> {
    return await this.writingRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['tasks'],
      order: { created_at: 'DESC' },
    });
  }

  async getWritingByTestId(
    testId: string,
    centerId: string,
  ): Promise<IeltsWriting | null> {
    const writing = await this.writingRepository.findOne({
      where: { test_id: testId, center_id: centerId, is_active: true },
      relations: ['tasks'],
    });

    return writing;
  }

  // Create complete test with listening, reading, and writing
  async createCompleteTest(
    testData: CreateIeltsTestDto,
    listeningData: CreateListeningDto,
    readingData: CreateReadingDto,
    writingData: CreateWritingDto,
    userId: string,
    centerId: string,
  ): Promise<IeltsTest> {
    // Create test first
    const test = await this.createTest(testData, userId, centerId);

    // Create listening with test_id reference
    await this.createListening(
      { ...listeningData, test_id: test.id },
      userId,
      centerId,
    );

    // Create reading with test_id reference
    await this.createReading(
      { ...readingData, test_id: test.id },
      userId,
      centerId,
    );

    // Create writing with test_id reference
    await this.createWriting(
      { ...writingData, test_id: test.id },
      userId,
      centerId,
    );

    return await this.getTestById(test.id, centerId);
  }
}
