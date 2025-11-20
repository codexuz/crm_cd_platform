import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentAssignedTest } from '../../entities/student-assigned-test.entity';
import { IeltsTest } from '../../entities/ielts-test.entity';
import {
  AssignTestToStudentDto,
  UpdateAssignedTestDto,
  TestResults,
  SaveListeningAnswerDto,
  SaveReadingAnswerDto,
  SaveWritingTaskDto,
  SaveSectionProgressDto,
  TestContentResponse,
} from './dto/student-test.dto';

@Injectable()
export class StudentTestsService {
  constructor(
    @InjectRepository(StudentAssignedTest)
    private studentTestRepository: Repository<StudentAssignedTest>,
    @InjectRepository(IeltsTest)
    private ieltsTestRepository: Repository<IeltsTest>,
  ) {}

  private generateCandidateId(): string {
    // Generate a random 10-digit number
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  async assignTestToStudent(
    assignDto: AssignTestToStudentDto,
    teacherId: string,
    centerId: string,
  ): Promise<StudentAssignedTest> {
    // Verify test exists and belongs to the center
    const test = await this.ieltsTestRepository.findOne({
      where: { id: assignDto.test_id, center_id: centerId, is_active: true },
    });

    if (!test) {
      throw new NotFoundException(
        'Test not found or does not belong to this center',
      );
    }

    // Generate unique candidate ID
    let candidateId = this.generateCandidateId();
    let exists = await this.studentTestRepository.findOne({
      where: { candidate_id: candidateId },
    });

    // Ensure uniqueness
    while (exists) {
      candidateId = this.generateCandidateId();
      exists = await this.studentTestRepository.findOne({
        where: { candidate_id: candidateId },
      });
    }

    // Create assignment
    const assignment = new StudentAssignedTest();
    assignment.candidate_id = candidateId;
    assignment.student_id = assignDto.student_id;
    assignment.test_id = assignDto.test_id;
    assignment.center_id = centerId;
    assignment.assigned_by = teacherId;
    assignment.test_start_time = assignDto.test_start_time
      ? new Date(assignDto.test_start_time)
      : null;
    assignment.test_end_time = assignDto.test_end_time
      ? new Date(assignDto.test_end_time)
      : null;
    assignment.notes = assignDto.notes || null;
    assignment.status = 'pending';

    return await this.studentTestRepository.save(assignment);
  }

  async getAssignedTestsByCenter(
    centerId: string,
  ): Promise<StudentAssignedTest[]> {
    return await this.studentTestRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['test', 'teacher', 'student'],
      order: { created_at: 'DESC' },
    });
  }

  async getAssignedTestById(
    id: string,
    centerId: string,
  ): Promise<StudentAssignedTest> {
    const assignment = await this.studentTestRepository.findOne({
      where: { id, center_id: centerId, is_active: true },
      relations: ['test', 'teacher', 'student'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async updateAssignedTest(
    id: string,
    updateDto: UpdateAssignedTestDto,
    centerId: string,
  ): Promise<StudentAssignedTest> {
    const assignment = await this.getAssignedTestById(id, centerId);

    if (updateDto.test_start_time) {
      assignment.test_start_time = new Date(updateDto.test_start_time);
    }
    if (updateDto.test_end_time) {
      assignment.test_end_time = new Date(updateDto.test_end_time);
    }
    if (updateDto.status) {
      assignment.status = updateDto.status;
    }
    if (updateDto.notes !== undefined) {
      assignment.notes = updateDto.notes;
    }

    return await this.studentTestRepository.save(assignment);
  }

  async deleteAssignedTest(id: string, centerId: string): Promise<void> {
    const assignment = await this.getAssignedTestById(id, centerId);
    assignment.is_active = false;
    await this.studentTestRepository.save(assignment);
  }

  // Student-facing methods
  async getStudentAssignment(
    candidateId: string,
  ): Promise<StudentAssignedTest> {
    const assignment = await this.studentTestRepository.findOne({
      where: {
        candidate_id: candidateId,
        is_active: true,
      },
      relations: ['test', 'center', 'student'],
    });

    if (!assignment) {
      throw new NotFoundException(
        'No assignment found for this candidate ID and email',
      );
    }

    // Check if test is expired
    if (assignment.test_end_time && new Date() > assignment.test_end_time) {
      if (
        assignment.status !== 'completed' &&
        assignment.status !== 'expired'
      ) {
        assignment.status = 'expired';
        await this.studentTestRepository.save(assignment);
      }
    }

    return assignment;
  }

  async startTest(candidateId: string): Promise<StudentAssignedTest> {
    const assignment = await this.getStudentAssignment(candidateId);

    if (assignment.status === 'completed') {
      throw new BadRequestException('Test already completed');
    }

    if (assignment.status === 'expired') {
      throw new BadRequestException('Test has expired');
    }

    // Check if test has expired (but allow early start)
    if (assignment.test_end_time && new Date() > assignment.test_end_time) {
      assignment.status = 'expired';
      await this.studentTestRepository.save(assignment);
      throw new BadRequestException('Test has expired');
    }

    assignment.status = 'in_progress';
    return await this.studentTestRepository.save(assignment);
  }

  async submitTestResults(
    candidateId: string,
    results: TestResults,
  ): Promise<StudentAssignedTest> {
    const assignment = await this.getStudentAssignment(candidateId);

    if (assignment.status === 'completed') {
      throw new BadRequestException('Test already completed');
    }

    if (assignment.status === 'expired') {
      throw new BadRequestException('Test has expired');
    }

    assignment.status = 'completed';
    assignment.completed_at = new Date();
    assignment.test_results = results;

    return await this.studentTestRepository.save(assignment);
  }

  async getTestContent(candidateId: string): Promise<TestContentResponse> {
    const assignment = await this.studentTestRepository.findOne({
      where: {
        candidate_id: candidateId,
        is_active: true,
      },
      relations: ['test', 'student'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status === 'expired') {
      throw new BadRequestException('Test has expired');
    }

    if (assignment.status === 'completed') {
      throw new BadRequestException('Test already completed');
    }

    return {
      test: assignment.test,
      candidate_id: assignment.candidate_id,
      student: assignment.student,
      test_start_time: assignment.test_start_time?.toISOString() || null,
      test_end_time: assignment.test_end_time?.toISOString() || null,
      status: assignment.status,
    };
  }

  // Save individual listening answer
  async saveListeningAnswer(
    candidateId: string,
    saveDto: SaveListeningAnswerDto,
  ): Promise<{ message: string }> {
    const assignment = await this.getStudentAssignment(candidateId);

    if (assignment.status === 'completed' || assignment.status === 'expired') {
      throw new BadRequestException('Test is no longer active');
    }

    // Initialize test_results if not exists
    const testResults = (assignment.test_results as TestResults) || {};

    // Initialize listening section if not exists
    if (!testResults.listening) {
      testResults.listening = { answers: {} };
    }

    // Save the answer
    testResults.listening.answers[saveDto.question_id] = saveDto.answer;

    assignment.test_results = testResults;
    await this.studentTestRepository.save(assignment);

    return { message: 'Listening answer saved successfully' };
  }

  // Save individual reading answer
  async saveReadingAnswer(
    candidateId: string,
    saveDto: SaveReadingAnswerDto,
  ): Promise<{ message: string }> {
    const assignment = await this.getStudentAssignment(candidateId);

    if (assignment.status === 'completed' || assignment.status === 'expired') {
      throw new BadRequestException('Test is no longer active');
    }

    // Initialize test_results if not exists
    const testResults = (assignment.test_results as TestResults) || {};

    // Initialize reading section if not exists
    if (!testResults.reading) {
      testResults.reading = { answers: {} };
    }

    // Save the answer
    testResults.reading.answers[saveDto.question_id] = saveDto.answer;

    assignment.test_results = testResults;
    await this.studentTestRepository.save(assignment);

    return { message: 'Reading answer saved successfully' };
  }

  // Save writing task
  async saveWritingTask(
    candidateId: string,
    saveDto: SaveWritingTaskDto,
  ): Promise<{ message: string }> {
    const assignment = await this.getStudentAssignment(candidateId);

    if (assignment.status === 'completed' || assignment.status === 'expired') {
      throw new BadRequestException('Test is no longer active');
    }

    // Initialize test_results if not exists
    const testResults = (assignment.test_results as TestResults) || {};

    // Initialize writing section if not exists
    if (!testResults.writing) {
      testResults.writing = {};
    }

    // Save the writing task
    testResults.writing[saveDto.task] = {
      answer: saveDto.answer,
      word_count: saveDto.word_count,
      time_spent: saveDto.time_spent,
    };

    assignment.test_results = testResults;
    await this.studentTestRepository.save(assignment);

    return { message: `${saveDto.task} saved successfully` };
  }

  // Save section progress (multiple answers at once)
  async saveSectionProgress(
    candidateId: string,
    saveDto: SaveSectionProgressDto,
  ): Promise<{ message: string }> {
    const assignment = await this.getStudentAssignment(candidateId);

    if (assignment.status === 'completed' || assignment.status === 'expired') {
      throw new BadRequestException('Test is no longer active');
    }

    // Initialize test_results if not exists
    const testResults = (assignment.test_results as TestResults) || {};

    // Handle different section types
    if (saveDto.section === 'writing') {
      // For writing, we don't save answers, only time_spent and current_question
      if (!testResults.writing) {
        testResults.writing = {};
      }

      if (saveDto.time_spent !== undefined) {
        testResults.writing.time_spent = saveDto.time_spent;
      }

      if (saveDto.current_question) {
        testResults.writing.current_question = saveDto.current_question;
      }
    } else {
      // For listening and reading sections
      if (!testResults[saveDto.section]) {
        testResults[saveDto.section] = { answers: {} };
      }

      const sectionData = testResults[saveDto.section]!;

      // Save answers if provided
      if (saveDto.answers) {
        sectionData.answers = {
          ...sectionData.answers,
          ...saveDto.answers,
        };
      }

      // Save time spent if provided
      if (saveDto.time_spent !== undefined) {
        sectionData.time_spent = saveDto.time_spent;
      }

      // Save current question progress if provided
      if (saveDto.current_question) {
        sectionData.current_question = saveDto.current_question;
      }
    }

    assignment.test_results = testResults;
    await this.studentTestRepository.save(assignment);

    return { message: `${saveDto.section} progress saved successfully` };
  }
}
