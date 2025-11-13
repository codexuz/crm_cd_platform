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
  ) {}

  // IELTS Test CRUD
  async createTest(
    createTestDto: CreateIeltsTestDto,
    centerId: string,
    userId: string,
  ): Promise<IeltsTest> {
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
    centerId: string,
    userId: string,
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
    centerId: string,
    userId: string,
  ): Promise<IeltsListening> {
    const { parts, ...listeningData } = createListeningDto;

    // Create listening
    const listening = this.listeningRepository.create({
      ...listeningData,
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

  // Reading CRUD
  async createReading(
    createReadingDto: CreateReadingDto,
    centerId: string,
    userId: string,
  ): Promise<IeltsReading> {
    const { parts, ...readingData } = createReadingDto;

    // Create reading
    const reading = this.readingRepository.create({
      ...readingData,
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

  // Writing CRUD
  async createWriting(
    createWritingDto: CreateWritingDto,
    centerId: string,
    userId: string,
  ): Promise<IeltsWriting> {
    const { tasks, ...writingData } = createWritingDto;

    // Create writing
    const writing = this.writingRepository.create({
      ...writingData,
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

  // Create complete test with listening, reading, and writing
  async createCompleteTest(
    testData: CreateIeltsTestDto,
    listeningData: CreateListeningDto,
    readingData: CreateReadingDto,
    writingData: CreateWritingDto,
    centerId: string,
    userId: string,
  ): Promise<IeltsTest> {
    // Create test first
    const test = await this.createTest(testData, centerId, userId);

    // Create listening with test_id reference
    await this.createListening(
      { ...listeningData, test_id: test.id },
      centerId,
      userId,
    );

    // Create reading with test_id reference
    await this.createReading(
      { ...readingData, test_id: test.id },
      centerId,
      userId,
    );

    // Create writing with test_id reference
    await this.createWriting(
      { ...writingData, test_id: test.id },
      centerId,
      userId,
    );

    return await this.getTestById(test.id, centerId);
  }
}
