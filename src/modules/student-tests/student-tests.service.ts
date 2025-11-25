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
        listening_final: true,
        reading_final: true,
        writing_final: true,
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
        listening_final: true,
        reading_final: true,
        writing_final: true,
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
        testResults.writing = { answers: [] };
      }

      if (saveDto.answers && Array.isArray(saveDto.answers)) {
        testResults.writing.answers = saveDto.answers as {
          task_1_answer?: string;
          task_2_answer?: string;
          word_count: number;
        }[];
      }
    } else {
      // For listening and reading sections
      if (!testResults[saveDto.section]) {
        testResults[saveDto.section] = {
          answers: [],
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

  // Helper: Normalize answer for comparison
  private normalizeAnswer(answer: string | number): string {
    return answer.toString().trim().toLowerCase();
  }

  // Helper: Check if answer is correct (supports multiple acceptable answers)
  private isAnswerCorrect(
    studentAnswer: string | number,
    correctAnswer: string | number | string[],
  ): boolean {
    const normalized = this.normalizeAnswer(studentAnswer);

    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(
        (ans) => this.normalizeAnswer(ans) === normalized,
      );
    }

    return this.normalizeAnswer(correctAnswer) === normalized;
  }

  // Helper: Convert correct answers to band score (IELTS standard)
  private convertToBandScore(correctAnswers: number): number {
    if (correctAnswers >= 39) return 9.0;
    if (correctAnswers >= 37) return 8.5;
    if (correctAnswers >= 35) return 8.0;
    if (correctAnswers >= 33) return 7.5;
    if (correctAnswers >= 30) return 7.0;
    if (correctAnswers >= 27) return 6.5;
    if (correctAnswers >= 23) return 6.0;
    if (correctAnswers >= 19) return 5.5;
    if (correctAnswers >= 15) return 5.0;
    if (correctAnswers >= 13) return 4.5;
    if (correctAnswers >= 10) return 4.0;
    if (correctAnswers >= 8) return 3.5;
    if (correctAnswers >= 6) return 3.0;
    if (correctAnswers >= 4) return 2.5;
    return 2.0;
  }

  // Check listening answers
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
  async checkListeningAnswers(candidateId: string) {
    const assignment = await this.studentTestRepository.findOne({
      where: { candidate_id: candidateId, is_active: true },
      relations: ['test', 'test.listening', 'test.listening.parts'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const testResults = assignment.test_results as TestResults;
    if (!testResults?.listening?.answers) {
      throw new BadRequestException('No listening answers found');
    }

    const studentAnswers = testResults.listening.answers as any;
    let correct = 0;
    let totalQuestions = 0;

    // Get answer keys from listening parts
    const listeningParts = assignment.test?.listening?.parts || [];

    // Build a map of part_id -> correct answers
    const partAnswerKeys: Record<string, any> = {};
    for (const part of listeningParts) {
      if (part.id && part.answers) {
        partAnswerKeys[part.id] = part.answers;
      }
    }

    console.log('=== LISTENING CHECK DEBUG ===');
    console.log('Student Answers:', JSON.stringify(studentAnswers, null, 2));
    console.log('Part Answer Keys:', JSON.stringify(partAnswerKeys, null, 2));

    // Process each part in student answers
    for (const partId in studentAnswers) {
      const studentPartAnswers = studentAnswers[partId];
      const correctPartAnswers = partAnswerKeys[partId];

      if (!correctPartAnswers) {
        continue; // Skip if no answer key found for this part
      }

      // Process each question container
      for (const containerId in studentPartAnswers) {
        const containerAnswers = studentPartAnswers[containerId];

        // Process each question
        for (const questionNum in containerAnswers) {
          const studentAnswer = containerAnswers[questionNum];
          const correctAnswer = correctPartAnswers[questionNum];

          totalQuestions++;

          if (correctAnswer !== undefined) {
            const isCorrect = this.isAnswerCorrect(
              studentAnswer,
              correctAnswer,
            );
            console.log(
              `Q${questionNum}: Student="${studentAnswer}" vs Correct="${correctAnswer}" => ${isCorrect ? 'CORRECT' : 'WRONG'}`,
            );
            if (isCorrect) {
              correct++;
            }
          }
        }
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

    console.log(`Total: ${correct}/${totalQuestions} correct`);

    const incorrect = totalQuestions - correct;
    const score = this.convertToBandScore(correct);

    const listeningFinal = {
      correct,
      incorrect,
      score,
      totalQuestions,
    };

    // Save to listening_final field
    assignment.listening_final = listeningFinal;
    await this.studentTestRepository.save(assignment);

    return listeningFinal;
  }

  // Check reading answers
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
  async checkReadingAnswers(candidateId: string) {
    const assignment = await this.studentTestRepository.findOne({
      where: { candidate_id: candidateId, is_active: true },
      relations: [
        'test',
        'test.reading',
        'test.reading.parts',
        'test.reading.parts.question',
      ],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const testResults = assignment.test_results as TestResults;
    if (!testResults?.reading?.answers) {
      throw new BadRequestException('No reading answers found');
    }

    const studentAnswers = testResults.reading.answers as any;
    let correct = 0;
    let totalQuestions = 0;

    // Get answer keys from reading parts
    const readingParts = assignment.test?.reading?.parts || [];

    // Build a merged answer key from all parts
    const mergedAnswerKey: any = {};
    for (const part of readingParts) {
      if (part.answers) {
        const partAnswers = part.answers as any;
        Object.assign(mergedAnswerKey, partAnswers);
      }
    }

    console.log('=== READING CHECK DEBUG ===');
    console.log('Student Answers:', JSON.stringify(studentAnswers, null, 2));
    console.log('Merged Answer Key:', JSON.stringify(mergedAnswerKey, null, 2));

    // Build a list of all question containers in order from the parts
    const orderedQuestionContainers: string[] = [];
    for (const part of readingParts) {
      if (part.question?.content) {
        try {
          const questionContent = Array.isArray(part.question.content)
            ? part.question.content
            : JSON.parse(part.question.content as string);

          for (const questionItem of questionContent) {
            if (questionItem.id) {
              orderedQuestionContainers.push(questionItem.id);
            }
          }
        } catch (error) {
          console.error('Error parsing question content:', error);
        }
      }
    }

    console.log('Ordered Question Containers:', orderedQuestionContainers);

    // Collect all student answers in the correct order based on question containers
    const allStudentAnswers: any[] = [];
    for (const containerId of orderedQuestionContainers) {
      const studentContainerAnswers = studentAnswers[containerId];
      if (Array.isArray(studentContainerAnswers)) {
        allStudentAnswers.push(...studentContainerAnswers);
      }
    }

    console.log('All Student Answers (ordered):', allStudentAnswers);

    // Compare each answer against the merged answer key
    allStudentAnswers.forEach((studentAnswer: any, index: number) => {
      totalQuestions++;
      const questionNum = (index + 1).toString();
      const correctAnswer = mergedAnswerKey[questionNum];

      if (correctAnswer !== undefined) {
        const isCorrect = this.isAnswerCorrect(studentAnswer, correctAnswer);
        console.log(
          `Q${questionNum}: Student="${studentAnswer}" vs Correct="${correctAnswer}" => ${isCorrect ? 'CORRECT' : 'WRONG'}`,
        );
        if (isCorrect) {
          correct++;
        }
      }
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

    console.log(`Total: ${correct}/${totalQuestions} correct`);

    const incorrect = totalQuestions - correct;
    const score = this.convertToBandScore(correct);

    const readingFinal = {
      correct,
      incorrect,
      score,
      totalQuestions,
    };

    // Save to reading_final field
    assignment.reading_final = readingFinal;
    await this.studentTestRepository.save(assignment);

    return readingFinal;
  }

  // Check/Grade writing section
  async checkWritingAnswers(
    candidateId: string,
    task1Score?: number,
    task2Score?: number,
    feedback?: string,
  ) {
    const assignment = await this.getStudentAssignment(candidateId);

    const testResults = assignment.test_results as TestResults;
    if (!testResults?.writing?.answers) {
      throw new BadRequestException('No writing answers found');
    }

    const writingFinal: {
      task1Score?: number;
      task2Score?: number;
      averageScore?: number;
      feedback: string;
    } = {
      feedback: feedback || '',
    };

    if (task1Score !== undefined) {
      writingFinal.task1Score = task1Score;
    }
    if (task2Score !== undefined) {
      writingFinal.task2Score = task2Score;
    }

    // Calculate weighted average if both scores available (Task 2 is weighted 2x)
    if (typeof task1Score === 'number' && typeof task2Score === 'number') {
      const weighted = (task1Score + 2 * task2Score) / 3;
      // Round to nearest 0.5 using IELTS rounding rules
      const decimal = weighted - Math.floor(weighted);
      if (decimal < 0.25) {
        writingFinal.averageScore = Math.floor(weighted);
      } else if (decimal < 0.75) {
        writingFinal.averageScore = Math.floor(weighted) + 0.5;
      } else {
        writingFinal.averageScore = Math.ceil(weighted);
      }
    }

    // Save to writing_final field
    assignment.writing_final = writingFinal;
    await this.studentTestRepository.save(assignment);

    return writingFinal;
  }

  // Auto-grade entire test (listening and reading only)
  async autoGradeTest(candidateId: string) {
    const listeningResult = await this.checkListeningAnswers(candidateId);
    const readingResult = await this.checkReadingAnswers(candidateId);

    return {
      listening: listeningResult,
      reading: readingResult,
      message:
        'Auto-grading completed for listening and reading. Writing section requires manual grading.',
    };
  }
}
