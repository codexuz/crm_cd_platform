import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IeltsTest,
  IeltsListening,
  IeltsListeningPart,
  IeltsReading,
  IeltsReadingPart,
  IeltsQuestion,
  IeltsAudio,
  ListeningPart,
  ReadingPart,
} from '../../entities';
import {
  CreateIeltsTestDto,
  UpdateIeltsTestDto,
  CreateListeningDto,
  CreateReadingDto,
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
    @InjectRepository(IeltsQuestion)
    private questionRepository: Repository<IeltsQuestion>,
    @InjectRepository(IeltsAudio)
    private audioRepository: Repository<IeltsAudio>,
  ) {}

  // IELTS Test CRUD
  async createTest(
    createTestDto: CreateIeltsTestDto,
    centerId: number,
    userId: number,
  ): Promise<IeltsTest> {
    const test = this.ieltsTestRepository.create({
      ...createTestDto,
      center_id: centerId,
      created_by: userId,
    });
    return await this.ieltsTestRepository.save(test);
  }

  async getAllTests(centerId: number): Promise<IeltsTest[]> {
    return await this.ieltsTestRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['listening', 'reading'],
      order: { created_at: 'DESC' },
    });
  }

  async getTestById(id: number, centerId: number): Promise<IeltsTest> {
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
    id: number,
    updateTestDto: UpdateIeltsTestDto,
    centerId: number,
    userId: number,
  ): Promise<IeltsTest> {
    const test = await this.getTestById(id, centerId);
    Object.assign(test, updateTestDto);
    test.updated_by = userId;
    return await this.ieltsTestRepository.save(test);
  }

  async deleteTest(id: number, centerId: number): Promise<void> {
    const test = await this.getTestById(id, centerId);
    test.is_active = false;
    await this.ieltsTestRepository.save(test);
  }

  // Listening CRUD
  async createListening(
    createListeningDto: CreateListeningDto,
    centerId: number,
    userId: number,
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
      const audio = this.audioRepository.create({
        ...partDto.audio,
        center_id: centerId,
        uploaded_by: userId,
      });
      const savedAudio = await this.audioRepository.save(audio);

      // Create part
      const part = this.listeningPartRepository.create({
        listening_id: savedListening.id,
        part: partDto.part as ListeningPart,
        question_id: savedQuestion.id,
        audio_id: savedAudio.id,
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
    id: number,
    centerId: number,
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

  async getAllListenings(centerId: number): Promise<IeltsListening[]> {
    return await this.listeningRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['parts'],
      order: { created_at: 'DESC' },
    });
  }

  // Reading CRUD
  async createReading(
    createReadingDto: CreateReadingDto,
    centerId: number,
    userId: number,
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

  async getReadingById(id: number, centerId: number): Promise<IeltsReading> {
    const reading = await this.readingRepository.findOne({
      where: { id, center_id: centerId },
      relations: ['parts', 'parts.question'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    return reading;
  }

  async getAllReadings(centerId: number): Promise<IeltsReading[]> {
    return await this.readingRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['parts'],
      order: { created_at: 'DESC' },
    });
  }

  // Create complete test with listening and reading
  async createCompleteTest(
    testData: CreateIeltsTestDto,
    listeningData: CreateListeningDto,
    readingData: CreateReadingDto,
    centerId: number,
    userId: number,
  ): Promise<IeltsTest> {
    // Create listening
    const listening = await this.createListening(
      listeningData,
      centerId,
      userId,
    );

    // Create reading
    const reading = await this.createReading(readingData, centerId, userId);

    // Create test with references
    const test = await this.createTest(
      {
        ...testData,
        listening_id: listening.id,
        reading_id: reading.id,
      },
      centerId,
      userId,
    );

    return await this.getTestById(test.id, centerId);
  }
}
