import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { 
  TestAssignment, 
  TestResult, 
  TestAssignmentStatus, 
  TestResultStatus,
  IeltsTest,
  User,
  RoleName
} from '../../entities';
import {
  CreateTestAssignmentDto,
  BulkAssignTestDto,
  UpdateTestAssignmentDto,
  StartTestDto,
  SubmitAnswersDto,
  CompleteTestDto,
  GradeTestDto,
  GetAssignmentsQueryDto,
  GetResultsQueryDto,
} from './dto/test-assignment.dto';

@Injectable()
export class TestAssignmentService {
  constructor(
    @InjectRepository(TestAssignment)
    private testAssignmentRepository: Repository<TestAssignment>,
    @InjectRepository(TestResult)
    private testResultRepository: Repository<TestResult>,
    @InjectRepository(IeltsTest)
    private ieltsTestRepository: Repository<IeltsTest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Assignment Management (for Centers/Teachers)
  async assignTest(
    createAssignmentDto: CreateTestAssignmentDto,
    centerId: number,
    assignedByUserId: number,
  ) {
    const { test_id, student_id, due_date, max_attempts = 1, time_limit_minutes, instructions } = createAssignmentDto;

    // Verify test exists and belongs to center
    const test = await this.ieltsTestRepository.findOne({
      where: { id: test_id, center_id: centerId },
    });
    if (!test) {
      throw new NotFoundException('Test not found or does not belong to your center');
    }

    // Verify student exists and belongs to center
    const student = await this.userRepository.findOne({
      where: { id: student_id, center_id: centerId },
      relations: ['roles'],
    });
    if (!student || !student.roles.some(role => role.role_name === RoleName.STUDENT)) {
      throw new NotFoundException('Student not found or does not belong to your center');
    }

    // Check if assignment already exists for this test and student
    const existingAssignment = await this.testAssignmentRepository.findOne({
      where: { 
        test_id, 
        student_id, 
        center_id: centerId,
        is_active: true 
      },
    });
    if (existingAssignment) {
      throw new BadRequestException('Test already assigned to this student');
    }

    const assignment = this.testAssignmentRepository.create({
      test_id,
      student_id,
      center_id: centerId,
      assigned_by_user_id: assignedByUserId,
      due_date: new Date(due_date),
      max_attempts,
      time_limit_minutes,
      instructions,
      status: TestAssignmentStatus.ASSIGNED,
    });

    return await this.testAssignmentRepository.save(assignment);
  }

  async bulkAssignTest(
    bulkAssignDto: BulkAssignTestDto,
    centerId: number,
    assignedByUserId: number,
  ) {
    const { test_id, student_ids, due_date, max_attempts = 1, time_limit_minutes, instructions } = bulkAssignDto;

    // Verify test exists and belongs to center
    const test = await this.ieltsTestRepository.findOne({
      where: { id: test_id, center_id: centerId },
    });
    if (!test) {
      throw new NotFoundException('Test not found or does not belong to your center');
    }

    // Verify all students exist and belong to center
    const students = await this.userRepository.find({
      where: { 
        id: { $in: student_ids } as any,
        center_id: centerId 
      },
      relations: ['roles'],
    });

    const validStudents = students.filter(student => 
      student.roles.some(role => role.role_name === RoleName.STUDENT)
    );

    if (validStudents.length !== student_ids.length) {
      throw new BadRequestException('Some students not found or do not belong to your center');
    }

    // Create assignments
    const assignments = validStudents.map(student => 
      this.testAssignmentRepository.create({
        test_id,
        student_id: student.id,
        center_id: centerId,
        assigned_by_user_id: assignedByUserId,
        due_date: new Date(due_date),
        max_attempts,
        time_limit_minutes,
        instructions,
        status: TestAssignmentStatus.ASSIGNED,
      })
    );

    return await this.testAssignmentRepository.save(assignments);
  }

  async updateAssignment(
    assignmentId: number,
    updateDto: UpdateTestAssignmentDto,
    centerId: number,
  ) {
    const assignment = await this.testAssignmentRepository.findOne({
      where: { id: assignmentId, center_id: centerId },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    Object.assign(assignment, updateDto);
    if (updateDto.due_date) {
      assignment.due_date = new Date(updateDto.due_date);
    }

    return await this.testAssignmentRepository.save(assignment);
  }

  async deleteAssignment(assignmentId: number, centerId: number) {
    const assignment = await this.testAssignmentRepository.findOne({
      where: { id: assignmentId, center_id: centerId },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.is_active = false;
    assignment.status = TestAssignmentStatus.CANCELLED;
    await this.testAssignmentRepository.save(assignment);
  }

  async getAssignments(
    query: GetAssignmentsQueryDto,
    centerId: number,
    userRoles: RoleName[],
    userId?: number,
  ) {
    const { status, student_id, test_id, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<TestAssignment> = {
      center_id: centerId,
      is_active: true,
    };

    if (status) where.status = status;
    if (test_id) where.test_id = test_id;
    
    // If user is a student, only show their assignments
    if (userRoles.includes(RoleName.STUDENT)) {
      where.student_id = userId;
    } else if (student_id) {
      where.student_id = student_id;
    }

    const [assignments, total] = await this.testAssignmentRepository.findAndCount({
      where,
      relations: ['test', 'student', 'assigned_by', 'results'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Student Test Taking
  async getMyAssignments(studentId: number, centerId: number) {
    return await this.testAssignmentRepository.find({
      where: { 
        student_id: studentId, 
        center_id: centerId,
        is_active: true 
      },
      relations: ['test', 'results'],
      order: { due_date: 'ASC' },
    });
  }

  async startTest(startTestDto: StartTestDto, studentId: number, centerId: number) {
    const { assignment_id } = startTestDto;

    const assignment = await this.testAssignmentRepository.findOne({
      where: { 
        id: assignment_id, 
        student_id: studentId,
        center_id: centerId,
        is_active: true 
      },
      relations: ['test'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if assignment is expired
    if (new Date() > assignment.due_date) {
      assignment.status = TestAssignmentStatus.EXPIRED;
      await this.testAssignmentRepository.save(assignment);
      throw new BadRequestException('Test assignment has expired');
    }

    // Check if student has exceeded max attempts
    if (assignment.attempts >= assignment.max_attempts) {
      throw new BadRequestException('Maximum attempts exceeded');
    }

    // Check if there's already an active test session
    const activeResult = await this.testResultRepository.findOne({
      where: {
        assignment_id,
        student_id: studentId,
        status: { $in: [TestResultStatus.STARTED, TestResultStatus.IN_PROGRESS] } as any,
      },
    });

    if (activeResult) {
      return { message: 'Test already in progress', result: activeResult };
    }

    // Create new test result
    const result = this.testResultRepository.create({
      assignment_id,
      student_id: studentId,
      center_id: centerId,
      status: TestResultStatus.STARTED,
      started_at: new Date(),
    });

    await this.testResultRepository.save(result);

    // Update assignment
    assignment.attempts += 1;
    assignment.status = TestAssignmentStatus.IN_PROGRESS;
    if (!assignment.start_time) {
      assignment.start_time = new Date();
    }
    await this.testAssignmentRepository.save(assignment);

    return { 
      message: 'Test started successfully', 
      result,
      test: assignment.test,
      time_limit_minutes: assignment.time_limit_minutes 
    };
  }

  async submitAnswers(submitDto: SubmitAnswersDto, studentId: number) {
    const { result_id, listening_answers, reading_answers, is_final_submission = false } = submitDto;

    const result = await this.testResultRepository.findOne({
      where: { id: result_id, student_id: studentId },
      relations: ['assignment'],
    });

    if (!result) {
      throw new NotFoundException('Test result not found');
    }

    if (result.status === TestResultStatus.COMPLETED) {
      throw new BadRequestException('Test already completed');
    }

    // Update answers
    if (listening_answers) {
      result.listening_answers = listening_answers;
    }
    if (reading_answers) {
      result.reading_answers = reading_answers;
    }

    if (is_final_submission) {
      result.status = TestResultStatus.COMPLETED;
      result.completed_at = new Date();
      
      // Calculate duration
      const duration = Math.round((result.completed_at.getTime() - result.started_at.getTime()) / (1000 * 60));
      result.duration_minutes = duration;

      // Update assignment status
      result.assignment.status = TestAssignmentStatus.COMPLETED;
      result.assignment.end_time = new Date();
      await this.testAssignmentRepository.save(result.assignment);
    } else {
      result.status = TestResultStatus.IN_PROGRESS;
    }

    return await this.testResultRepository.save(result);
  }

  async completeTest(completeDto: CompleteTestDto, studentId: number) {
    const { result_id, listening_answers, reading_answers } = completeDto;

    const result = await this.testResultRepository.findOne({
      where: { id: result_id, student_id: studentId },
      relations: ['assignment'],
    });

    if (!result) {
      throw new NotFoundException('Test result not found');
    }

    if (result.status === TestResultStatus.COMPLETED) {
      throw new BadRequestException('Test already completed');
    }

    // Update final answers
    result.listening_answers = listening_answers;
    result.reading_answers = reading_answers;
    result.status = TestResultStatus.COMPLETED;
    result.completed_at = new Date();
    
    // Calculate duration
    const duration = Math.round((result.completed_at.getTime() - result.started_at.getTime()) / (1000 * 60));
    result.duration_minutes = duration;

    // Update assignment status
    result.assignment.status = TestAssignmentStatus.COMPLETED;
    result.assignment.end_time = new Date();
    await this.testAssignmentRepository.save(result.assignment);

    return await this.testResultRepository.save(result);
  }

  // Grading and Review (for Teachers)
  async gradeTest(gradeDto: GradeTestDto, centerId: number, teacherId: number) {
    const { 
      result_id, 
      listening_score, 
      listening_correct_answers,
      reading_score, 
      reading_correct_answers,
      band_score,
      detailed_feedback,
      teacher_comments 
    } = gradeDto;

    const result = await this.testResultRepository.findOne({
      where: { id: result_id, center_id: centerId },
      relations: ['assignment', 'assignment.test'],
    });

    if (!result) {
      throw new NotFoundException('Test result not found');
    }

    if (result.status !== TestResultStatus.COMPLETED) {
      throw new BadRequestException('Cannot grade incomplete test');
    }

    // Update scores
    if (listening_score !== undefined) result.listening_score = listening_score;
    if (listening_correct_answers !== undefined) result.listening_correct_answers = listening_correct_answers;
    if (reading_score !== undefined) result.reading_score = reading_score;
    if (reading_correct_answers !== undefined) result.reading_correct_answers = reading_correct_answers;
    if (band_score !== undefined) result.band_score = band_score;
    if (detailed_feedback) result.detailed_feedback = detailed_feedback;
    if (teacher_comments) result.teacher_comments = teacher_comments;

    // Calculate overall score if both sections are graded
    if (result.listening_score && result.reading_score) {
      result.overall_score = (result.listening_score + result.reading_score) / 2;
    }

    result.is_reviewed = true;
    result.reviewed_at = new Date();
    result.reviewed_by_user_id = teacherId;

    return await this.testResultRepository.save(result);
  }

  async getTestResults(
    query: GetResultsQueryDto,
    centerId: number,
    userRoles: RoleName[],
    userId?: number,
  ) {
    const { status, student_id, assignment_id, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<TestResult> = {
      center_id: centerId,
    };

    if (status) where.status = status;
    if (assignment_id) where.assignment_id = assignment_id;
    
    // If user is a student, only show their results
    if (userRoles.includes(RoleName.STUDENT)) {
      where.student_id = userId;
    } else if (student_id) {
      where.student_id = student_id;
    }

    const [results, total] = await this.testResultRepository.findAndCount({
      where,
      relations: ['assignment', 'assignment.test', 'student', 'reviewed_by'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTestResultById(resultId: number, centerId: number, userRoles: RoleName[], userId?: number) {
    const where: FindOptionsWhere<TestResult> = {
      id: resultId,
      center_id: centerId,
    };

    // If user is a student, only allow access to their own results
    if (userRoles.includes(RoleName.STUDENT)) {
      where.student_id = userId;
    }

    const result = await this.testResultRepository.findOne({
      where,
      relations: [
        'assignment', 
        'assignment.test', 
        'assignment.test.listening', 
        'assignment.test.reading',
        'student', 
        'reviewed_by'
      ],
    });

    if (!result) {
      throw new NotFoundException('Test result not found');
    }

    return result;
  }

  // Analytics and Reporting
  async getCenterStatistics(centerId: number) {
    const totalAssignments = await this.testAssignmentRepository.count({
      where: { center_id: centerId, is_active: true },
    });

    const completedTests = await this.testResultRepository.count({
      where: { center_id: centerId, status: TestResultStatus.COMPLETED },
    });

    const avgScores = await this.testResultRepository
      .createQueryBuilder('result')
      .select('AVG(result.overall_score)', 'avgOverall')
      .addSelect('AVG(result.listening_score)', 'avgListening')
      .addSelect('AVG(result.reading_score)', 'avgReading')
      .addSelect('AVG(result.band_score)', 'avgBand')
      .where('result.center_id = :centerId', { centerId })
      .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED })
      .andWhere('result.overall_score IS NOT NULL')
      .getRawOne();

    const statusBreakdown = await this.testAssignmentRepository
      .createQueryBuilder('assignment')
      .select('assignment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('assignment.center_id = :centerId', { centerId })
      .andWhere('assignment.is_active = true')
      .groupBy('assignment.status')
      .getRawMany();

    return {
      totalAssignments,
      completedTests,
      completionRate: totalAssignments > 0 ? (completedTests / totalAssignments) * 100 : 0,
      averageScores: {
        overall: parseFloat(avgScores?.avgOverall || '0'),
        listening: parseFloat(avgScores?.avgListening || '0'),
        reading: parseFloat(avgScores?.avgReading || '0'),
        band: parseFloat(avgScores?.avgBand || '0'),
      },
      statusBreakdown,
    };
  }
}