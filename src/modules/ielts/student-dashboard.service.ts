import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  IeltsTest,
  TestAssignment, 
  TestResult, 
  TestAssignmentStatus, 
  TestResultStatus,
  User,
  RoleName
} from '../../entities';

@Injectable()
export class StudentDashboardService {
  constructor(
    @InjectRepository(IeltsTest)
    private ieltsTestRepository: Repository<IeltsTest>,
    @InjectRepository(TestAssignment)
    private testAssignmentRepository: Repository<TestAssignment>,
    @InjectRepository(TestResult)
    private testResultRepository: Repository<TestResult>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStudentDashboard(studentId: number, centerId?: number) {
    // Get student info
    const student = await this.userRepository.findOne({
      where: { id: studentId },
      relations: ['roles', 'center'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Use center_id from student if not provided (for individual students without center)
    const filterCenterId = centerId || student.center_id;

    // Get pending assignments
    const pendingAssignments = await this.testAssignmentRepository.find({
      where: { 
        student_id: studentId,
        status: TestAssignmentStatus.ASSIGNED,
        is_active: true,
        ...(filterCenterId && { center_id: filterCenterId })
      },
      relations: ['test'],
      order: { due_date: 'ASC' },
      take: 5,
    });

    // Get in-progress assignments
    const inProgressAssignments = await this.testAssignmentRepository.find({
      where: { 
        student_id: studentId,
        status: TestAssignmentStatus.IN_PROGRESS,
        is_active: true,
        ...(filterCenterId && { center_id: filterCenterId })
      },
      relations: ['test', 'results'],
      order: { updated_at: 'DESC' },
    });

    // Get recent completed tests
    const recentResults = await this.testResultRepository.find({
      where: { 
        student_id: studentId,
        status: TestResultStatus.COMPLETED,
        ...(filterCenterId && { center_id: filterCenterId })
      },
      relations: ['assignment', 'assignment.test'],
      order: { completed_at: 'DESC' },
      take: 5,
    });

    // Get statistics
    const totalAssignments = await this.testAssignmentRepository.count({
      where: { 
        student_id: studentId,
        is_active: true,
        ...(filterCenterId && { center_id: filterCenterId })
      },
    });

    const completedTests = await this.testResultRepository.count({
      where: { 
        student_id: studentId,
        status: TestResultStatus.COMPLETED,
        ...(filterCenterId && { center_id: filterCenterId })
      },
    });

    let avgScoresQuery = this.testResultRepository
      .createQueryBuilder('result')
      .select('AVG(result.overall_score)', 'avgOverall')
      .addSelect('AVG(result.listening_score)', 'avgListening') 
      .addSelect('AVG(result.reading_score)', 'avgReading')
      .addSelect('AVG(result.band_score)', 'avgBand')
      .where('result.student_id = :studentId', { studentId })
      .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED })
      .andWhere('result.overall_score IS NOT NULL');
    
    if (filterCenterId) {
      avgScoresQuery = avgScoresQuery.andWhere('result.center_id = :centerId', { centerId: filterCenterId });
    }
    
    const avgScores = await avgScoresQuery.getRawOne();

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        center: student.center,
      },
      statistics: {
        totalAssignments,
        completedTests,
        pendingTests: pendingAssignments.length,
        inProgressTests: inProgressAssignments.length,
        completionRate: totalAssignments > 0 ? (completedTests / totalAssignments) * 100 : 0,
        averageScores: {
          overall: parseFloat(avgScores?.avgOverall || '0'),
          listening: parseFloat(avgScores?.avgListening || '0'),
          reading: parseFloat(avgScores?.avgReading || '0'),
          band: parseFloat(avgScores?.avgBand || '0'),
        },
      },
      pendingAssignments,
      inProgressAssignments,
      recentResults,
    };
  }

  async getAvailableTests(studentId: number, centerId?: number) {
    // For individual students (not part of a center), show public tests
    // For center students, show tests available to their center
    
    const student = await this.userRepository.findOne({
      where: { id: studentId },
      relations: ['center'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const filterCenterId = centerId || student.center_id;

    let whereCondition: any = { is_active: true };
    
    if (filterCenterId) {
      // Center student - show center's tests
      whereCondition.center_id = filterCenterId;
    } else {
      // Individual student - show public tests (you might want to add a is_public field)
      whereCondition.for_cdi = false; // or add a public flag
    }

    const availableTests = await this.ieltsTestRepository.find({
      where: whereCondition,
      relations: ['listening', 'reading'],
      order: { created_at: 'DESC' },
    });

    // Filter out tests that are already assigned to this student
    let assignedTestQuery = this.testAssignmentRepository
      .createQueryBuilder('assignment')
      .select('assignment.test_id')
      .where('assignment.student_id = :studentId', { studentId })
      .andWhere('assignment.is_active = true');
    
    if (filterCenterId) {
      assignedTestQuery = assignedTestQuery.andWhere('assignment.center_id = :centerId', { centerId: filterCenterId });
    }
    
    const assignedTestIds = await assignedTestQuery
      .getMany()
      .then(assignments => assignments.map(a => a.test_id));

    return availableTests.filter(test => !assignedTestIds.includes(test.id));
  }

  async selfAssignTest(studentId: number, testId: number, centerId?: number) {
    // Allow students to self-assign public tests
    const student = await this.userRepository.findOne({
      where: { id: studentId },
      relations: ['center'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const filterCenterId = centerId || student.center_id;

    // Check if test exists and is available
    const test = await this.ieltsTestRepository.findOne({
      where: { 
        id: testId, 
        is_active: true,
        ...(filterCenterId ? { center_id: filterCenterId } : { for_cdi: false })
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found or not available for self-assignment');
    }

    // Check if already assigned
    const existingAssignment = await this.testAssignmentRepository.findOne({
      where: { 
        test_id: testId, 
        student_id: studentId,
        is_active: true,
        ...(filterCenterId && { center_id: filterCenterId })
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('Test already assigned to you');
    }

    // Create self-assignment with default settings
    const assignment = this.testAssignmentRepository.create({
      test_id: testId,
      student_id: studentId,
      center_id: filterCenterId,
      assigned_by_user_id: studentId, // Self-assigned
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      max_attempts: 3, // Default 3 attempts
      time_limit_minutes: 180, // Default 3 hours
      instructions: 'Self-assigned practice test. Take your time and do your best!',
      status: TestAssignmentStatus.ASSIGNED,
    });

    return await this.testAssignmentRepository.save(assignment);
  }

  async getTestHistory(studentId: number, centerId?: number) {
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const filterCenterId = centerId || student.center_id;

    const results = await this.testResultRepository.find({
      where: { 
        student_id: studentId,
        ...(filterCenterId && { center_id: filterCenterId })
      },
      relations: ['assignment', 'assignment.test', 'reviewed_by'],
      order: { completed_at: 'DESC' },
    });

    // Group by month for better visualization
    const groupedResults = results.reduce((acc, result) => {
      if (result.completed_at) {
        const monthKey = result.completed_at.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = [];
        }
        acc[monthKey].push(result);
      }
      return acc;
    }, {} as Record<string, typeof results>);

    return {
      totalTests: results.length,
      results,
      groupedResults,
    };
  }

  async getPersonalAnalytics(studentId: number, centerId?: number) {
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const filterCenterId = centerId || student.center_id;

    // Get score progression over time
    let scoreProgressionQuery = this.testResultRepository
      .createQueryBuilder('result')
      .select([
        'result.completed_at',
        'result.overall_score',
        'result.listening_score',
        'result.reading_score',
        'result.band_score',
      ])
      .where('result.student_id = :studentId', { studentId })
      .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED })
      .andWhere('result.completed_at IS NOT NULL');
    
    if (filterCenterId) {
      scoreProgressionQuery = scoreProgressionQuery.andWhere('result.center_id = :centerId', { centerId: filterCenterId });
    }
    
    const scoreProgression = await scoreProgressionQuery
      .orderBy('result.completed_at', 'ASC')
      .getRawMany();

    // Get performance by test type
    let performanceQuery = this.testResultRepository
      .createQueryBuilder('result')
      .select('AVG(result.listening_score)', 'avgListening')
      .addSelect('AVG(result.reading_score)', 'avgReading')
      .addSelect('COUNT(*)', 'testCount')
      .where('result.student_id = :studentId', { studentId })
      .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED });
    
    if (filterCenterId) {
      performanceQuery = performanceQuery.andWhere('result.center_id = :centerId', { centerId: filterCenterId });
    }
    
    const performanceBySection = await performanceQuery.getRawOne();

    // Get strengths and weaknesses analysis
    const recentResults = await this.testResultRepository.find({
      where: { 
        student_id: studentId,
        status: TestResultStatus.COMPLETED,
        ...(filterCenterId && { center_id: filterCenterId })
      },
      order: { completed_at: 'DESC' },
      take: 5,
    });

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (recentResults.length > 0) {
      const avgListening = recentResults.reduce((sum, r) => sum + (r.listening_score || 0), 0) / recentResults.length;
      const avgReading = recentResults.reduce((sum, r) => sum + (r.reading_score || 0), 0) / recentResults.length;

      if (avgListening >= 7.0) strengths.push('Listening');
      else if (avgListening < 6.0) weaknesses.push('Listening');

      if (avgReading >= 7.0) strengths.push('Reading');
      else if (avgReading < 6.0) weaknesses.push('Reading');
    }

    return {
      scoreProgression,
      performanceBySection: {
        listening: parseFloat(performanceBySection?.avgListening || '0'),
        reading: parseFloat(performanceBySection?.avgReading || '0'),
        testCount: parseInt(performanceBySection?.testCount || '0'),
      },
      strengths,
      weaknesses,
      recommendations: this.generateRecommendations(strengths, weaknesses),
    };
  }

  private generateRecommendations(strengths: string[], weaknesses: string[]): string[] {
    const recommendations: string[] = [];

    if (weaknesses.includes('Listening')) {
      recommendations.push('Practice listening to different accents and speech speeds');
      recommendations.push('Focus on note-taking techniques while listening');
    }

    if (weaknesses.includes('Reading')) {
      recommendations.push('Work on skimming and scanning techniques');
      recommendations.push('Practice time management for reading passages');
    }

    if (strengths.includes('Listening') && weaknesses.includes('Reading')) {
      recommendations.push('Use your listening skills to improve reading by reading aloud');
    }

    if (strengths.includes('Reading') && weaknesses.includes('Listening')) {
      recommendations.push('Try following transcripts while listening to improve listening skills');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue practicing regularly to maintain your performance');
      recommendations.push('Focus on time management and test-taking strategies');
    }

    return recommendations;
  }
}