import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentAssignedTest } from '../../entities/student-assigned-test.entity';
import { IeltsTest } from '../../entities/ielts-test.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from '../email/email.service';
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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
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

    const savedAssignment = await this.studentTestRepository.save(assignment);

    // Send notification email to student
    try {
      const student = await this.userRepository.findOne({
        where: { id: assignDto.student_id },
      });

      if (student && student.email) {
        const testStartDate = assignDto.test_start_time
          ? new Date(assignDto.test_start_time).toLocaleString('en-US', {
              dateStyle: 'full',
              timeStyle: 'short',
            })
          : 'Not specified';
        const testEndDate = assignDto.test_end_time
          ? new Date(assignDto.test_end_time).toLocaleString('en-US', {
              dateStyle: 'full',
              timeStyle: 'short',
            })
          : 'Not specified';

        await this.emailService.sendEmail({
          to: student.email,
          subject: 'IELTS Test Assignment - Your Exam Details',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">IELTS Test Assignment</h1>
              <p>Dear ${student.name},</p>
              <p>You have been assigned an IELTS Mock test. Please find your exam details below:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Exam Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Candidate ID:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${candidateId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Test Start Time:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${testStartDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Test End Time:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${testEndDate}</td>
                  </tr>
                </table>
              </div>

              ${assignDto.notes ? `<p><strong>Notes:</strong> ${assignDto.notes}</p>` : ''}
              
              <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Important:</strong> Please save your Candidate ID. You will need it to access your test.
                </p>
              </div>
              
              <p>Good luck with your exam!</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you have any questions, please contact your center administrator.</p>
            </div>
          `,
          text: `
IELTS Test Assignment

Dear ${student.name},

You have been assigned an IELTS test.

Exam Details:
- Candidate ID: ${candidateId}
- Test Start Time: ${testStartDate}
- Test End Time: ${testEndDate}
${assignDto.notes ? `\n- Notes: ${assignDto.notes}` : ''}

Important: Please save your Candidate ID. You will need it to access your test.

Good luck with your exam!
          `,
        });
      }
    } catch (emailError) {
      // Log error but don't fail the assignment
      console.error('Failed to send test assignment email:', emailError);
    }

    return savedAssignment;
  }

  async getAssignedTestsByCenter(
    centerId: string,
  ): Promise<StudentAssignedTest[]> {
    return await this.studentTestRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['test', 'teacher', 'student'],
      select: {
        id: true,
        candidate_id: true,
        student_id: true,
        test_id: true,
        center_id: true,
        assigned_by: true,
        test_start_time: true,
        test_end_time: true,
        status: true,
        completed_at: true,
        test_results: true,
        notes: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        student: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
        teacher: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      },
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
      select: {
        id: true,
        candidate_id: true,
        student_id: true,
        test_id: true,
        center_id: true,
        assigned_by: true,
        test_start_time: true,
        test_end_time: true,
        status: true,
        completed_at: true,
        test_results: true,
        notes: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        student: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
        teacher: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      },
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
      relations: ['test', 'center', 'student', 'teacher'],
      select: {
        id: true,
        candidate_id: true,
        student_id: true,
        test_id: true,
        center_id: true,
        assigned_by: true,
        test_start_time: true,
        test_end_time: true,
        status: true,
        completed_at: true,
        test_results: true,
        notes: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        student: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
        teacher: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      },
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
      select: {
        id: true,
        candidate_id: true,
        student_id: true,
        test_id: true,
        test_start_time: true,
        test_end_time: true,
        status: true,
        student: {
          id: true,
          name: true,
          phone: true,
          email: true,
          email_verified: true,
          google_id: true,
          avatar_url: true,
          provider: true,
          center_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      },
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
      testResults.listening = {
        answers: [],
        score: 0,
        correct: 0,
        incorrect: 0,
      };
    }

    // Parse question_id to get index (e.g., "listening_1_1" -> index 0)
    const parts = saveDto.question_id.split('_');
    const questionIndex = parseInt(parts[parts.length - 1]) - 1;

    // Ensure answers array is large enough
    while (testResults.listening.answers.length <= questionIndex) {
      testResults.listening.answers.push('');
    }

    // Save the answer at the correct index
    testResults.listening.answers[questionIndex] = saveDto.answer;

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
      testResults.reading = { answers: [], score: 0, correct: 0, incorrect: 0 };
    }

    // Parse question_id to get index (e.g., "reading_2_3" -> index 2)
    const parts = saveDto.question_id.split('_');
    const questionIndex = parseInt(parts[parts.length - 1]) - 1;

    // Ensure answers array is large enough
    while (testResults.reading.answers.length <= questionIndex) {
      testResults.reading.answers.push('');
    }

    // Save the answer at the correct index
    testResults.reading.answers[questionIndex] = saveDto.answer;

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
      testResults.writing = { answers: [], feedback: '' };
    }

    // Ensure answers array has 2 elements (for task1 and task2)
    while (testResults.writing.answers.length < 2) {
      testResults.writing.answers.push({
        task_1_answer: '',
        task_2_answer: '',
        word_count: 0,
        score: 0,
      });
    }

    // Determine which task to update
    const taskIndex = saveDto.task === 'task1' ? 0 : 1;

    // Update the task answer
    if (saveDto.task === 'task1') {
      testResults.writing.answers[taskIndex].task_1_answer = saveDto.answer;
    } else {
      testResults.writing.answers[taskIndex].task_2_answer = saveDto.answer;
    }
    testResults.writing.answers[taskIndex].word_count = saveDto.word_count || 0;
    testResults.writing.answers[taskIndex].score = saveDto.score || 0;

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
      // For writing, save task answers
      if (!testResults.writing) {
        testResults.writing = { answers: [], feedback: '' };
      }

      if (saveDto.answers && Array.isArray(saveDto.answers)) {
        testResults.writing.answers = saveDto.answers as {
          task_1_answer?: string;
          task_2_answer?: string;
          word_count: number;
          score: number;
        }[];
      }
    } else {
      // For listening and reading sections
      if (!testResults[saveDto.section]) {
        testResults[saveDto.section] = {
          answers: [],
          score: 0,
          correct: 0,
          incorrect: 0,
        };
      }

      const sectionData = testResults[saveDto.section]!;

      // Save answers if provided
      if (saveDto.answers && Array.isArray(saveDto.answers)) {
        sectionData.answers = saveDto.answers as (string | number)[];
      }
    }

    assignment.test_results = testResults;
    await this.studentTestRepository.save(assignment);

    return { message: `${saveDto.section} progress saved successfully` };
  }
}
