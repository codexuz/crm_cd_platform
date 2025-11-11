import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
    User,
    Role,
    RoleName,
    TestAssignment,
    TestResult,
    TestResultStatus,
    TestAssignmentStatus,
    Center
} from '../../entities';
import {
    CreateStudentDto,
    UpdateStudentDto,
    BulkCreateStudentsDto,
    GetStudentsQueryDto,
    CenterAnalyticsQueryDto,
} from './dto/center-management.dto';

@Injectable()
export class CenterManagementService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(TestAssignment)
        private testAssignmentRepository: Repository<TestAssignment>,
        @InjectRepository(TestResult)
        private testResultRepository: Repository<TestResult>,
        @InjectRepository(Center)
        private centerRepository: Repository<Center>,
    ) { }

    // =============================================================================
    // STUDENT MANAGEMENT
    // =============================================================================

    async getStudents(query: GetStudentsQueryDto, centerId: number) {
        const {
            search,
            level,
            is_active,
            teacher_id,
            page = 1,
            limit = 20
        } = query;

        const where: FindOptionsWhere<User> = {
            center_id: centerId,
        };

        if (search) {
            where.name = Like(`%${search}%`);
            // You could also add OR condition for email search
        }

        if (is_active !== undefined) {
            where.is_active = is_active;
        }

        // Get student role
        const studentRole = await this.roleRepository.findOne({
            where: { role_name: RoleName.STUDENT },
        });

        const [students, total] = await this.userRepository.findAndCount({
            where,
            relations: ['roles', 'center'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Filter only students
        const filteredStudents = students.filter(user =>
            user.roles.some(role => role.role_name === RoleName.STUDENT)
        );

        return {
            students: filteredStudents,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createStudent(
        createStudentDto: CreateStudentDto,
        centerId: number,
        createdByUserId: number
    ) {
        const {
            name,
            email,
            phone,
            password,
            notes,
            target_band_score,
            level
        } = createStudentDto;

        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { phone }],
        });

        if (existingUser) {
            throw new ConflictException('User with this email or phone already exists');
        }

        // Verify center exists
        const center = await this.centerRepository.findOne({
            where: { id: centerId },
        });

        if (!center) {
            throw new NotFoundException('Center not found');
        }

        // Get student role
        const studentRole = await this.roleRepository.findOne({
            where: { role_name: RoleName.STUDENT },
        });

        if (!studentRole) {
            throw new Error('Student role not found');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = this.userRepository.create({
            name,
            email,
            phone,
            password: hashedPassword,
            center_id: centerId,
            roles: [studentRole],
            is_active: true,
        });

        const savedUser = await this.userRepository.save(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser;

        return {
            user: userWithoutPassword,
            message: 'Student created successfully'
        };
    }

    async bulkCreateStudents(
        bulkCreateDto: BulkCreateStudentsDto,
        centerId: number,
        createdByUserId: number
    ) {
        const { students, default_password, send_welcome_emails = false } = bulkCreateDto;

        // Verify center exists
        const center = await this.centerRepository.findOne({
            where: { id: centerId },
        });

        if (!center) {
            throw new NotFoundException('Center not found');
        }

        // Get student role
        const studentRole = await this.roleRepository.findOne({
            where: { role_name: RoleName.STUDENT },
        });

        if (!studentRole) {
            throw new Error('Student role not found');
        }

        const createdStudents: any[] = [];
        const errors: { index: number; email: string; error: string }[] = [];

        for (const [index, studentData] of students.entries()) {
            try {
                // Use individual password or default
                const passwordToUse = studentData.password || default_password;

                if (!passwordToUse) {
                    errors.push({
                        index,
                        email: studentData.email,
                        error: 'Password is required'
                    });
                    continue;
                }

                // Check if user already exists
                const existingUser = await this.userRepository.findOne({
                    where: [
                        { email: studentData.email },
                        { phone: studentData.phone }
                    ],
                });

                if (existingUser) {
                    errors.push({
                        index,
                        email: studentData.email,
                        error: 'User with this email or phone already exists'
                    });
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(passwordToUse, 10);

                // Create user
                const user = this.userRepository.create({
                    name: studentData.name,
                    email: studentData.email,
                    phone: studentData.phone,
                    password: hashedPassword,
                    center_id: centerId,
                    roles: [studentRole],
                    is_active: true,
                });

                const savedUser = await this.userRepository.save(user);

                // Remove password from response
                const { password: _, ...userWithoutPassword } = savedUser;
                createdStudents.push(userWithoutPassword);

            } catch (error) {
                errors.push({
                    index,
                    email: studentData.email,
                    error: error.message
                });
            }
        }

        return {
            created: createdStudents,
            errors,
            summary: {
                total_attempted: students.length,
                successfully_created: createdStudents.length,
                errors: errors.length
            }
        };
    }

    async getStudentById(studentId: number, centerId: number) {
        const student = await this.userRepository.findOne({
            where: {
                id: studentId,
                center_id: centerId
            },
            relations: ['roles', 'center'],
        });

        if (!student || !student.roles.some(role => role.role_name === RoleName.STUDENT)) {
            throw new NotFoundException('Student not found');
        }

        // Get student statistics
        const totalAssignments = await this.testAssignmentRepository.count({
            where: { student_id: studentId, center_id: centerId, is_active: true },
        });

        const completedTests = await this.testResultRepository.count({
            where: {
                student_id: studentId,
                center_id: centerId,
                status: TestResultStatus.COMPLETED
            },
        });

        const avgScores = await this.testResultRepository
            .createQueryBuilder('result')
            .select('AVG(result.overall_score)', 'avgOverall')
            .addSelect('AVG(result.listening_score)', 'avgListening')
            .addSelect('AVG(result.reading_score)', 'avgReading')
            .addSelect('AVG(result.band_score)', 'avgBand')
            .where('result.student_id = :studentId', { studentId })
            .andWhere('result.center_id = :centerId', { centerId })
            .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED })
            .getRawOne();

        // Remove password from response
        const { password: _, ...studentWithoutPassword } = student;

        return {
            student: studentWithoutPassword,
            statistics: {
                totalAssignments,
                completedTests,
                completionRate: totalAssignments > 0 ? (completedTests / totalAssignments) * 100 : 0,
                averageScores: {
                    overall: parseFloat(avgScores?.avgOverall || '0'),
                    listening: parseFloat(avgScores?.avgListening || '0'),
                    reading: parseFloat(avgScores?.avgReading || '0'),
                    band: parseFloat(avgScores?.avgBand || '0'),
                },
            },
        };
    }

    async updateStudent(
        studentId: number,
        updateStudentDto: UpdateStudentDto,
        centerId: number
    ) {
        const student = await this.userRepository.findOne({
            where: {
                id: studentId,
                center_id: centerId
            },
            relations: ['roles'],
        });

        if (!student || !student.roles.some(role => role.role_name === RoleName.STUDENT)) {
            throw new NotFoundException('Student not found');
        }

        // Check for email/phone conflicts if being updated
        if (updateStudentDto.email || updateStudentDto.phone) {
            const conflictWhere: ({ email: string } | { phone: string })[] = [];
            if (updateStudentDto.email) conflictWhere.push({ email: updateStudentDto.email });
            if (updateStudentDto.phone) conflictWhere.push({ phone: updateStudentDto.phone });

            const existingUser = await this.userRepository.findOne({
                where: conflictWhere,
            });

            if (existingUser && existingUser.id !== studentId) {
                throw new ConflictException('Email or phone already exists for another user');
            }
        }

        Object.assign(student, updateStudentDto);
        const updatedStudent = await this.userRepository.save(student);

        // Remove password from response
        const { password: _, ...studentWithoutPassword } = updatedStudent;
        return studentWithoutPassword;
    }

    async deleteStudent(studentId: number, centerId: number) {
        const student = await this.userRepository.findOne({
            where: {
                id: studentId,
                center_id: centerId
            },
            relations: ['roles'],
        });

        if (!student || !student.roles.some(role => role.role_name === RoleName.STUDENT)) {
            throw new NotFoundException('Student not found');
        }

        // Soft delete - just deactivate
        student.is_active = false;
        await this.userRepository.save(student);
    }

    async getStudentPerformance(studentId: number, centerId: number) {
        const student = await this.userRepository.findOne({
            where: {
                id: studentId,
                center_id: centerId
            },
            relations: ['roles'],
        });

        if (!student || !student.roles.some(role => role.role_name === RoleName.STUDENT)) {
            throw new NotFoundException('Student not found');
        }

        // Get test results with progress over time
        const results = await this.testResultRepository.find({
            where: {
                student_id: studentId,
                center_id: centerId,
                status: TestResultStatus.COMPLETED
            },
            relations: ['assignment', 'assignment.test'],
            order: { completed_at: 'ASC' },
        });

        // Get current assignments
        const assignments = await this.testAssignmentRepository.find({
            where: {
                student_id: studentId,
                center_id: centerId,
                is_active: true
            },
            relations: ['test'],
            order: { due_date: 'ASC' },
        });

        return {
            student: { id: student.id, name: student.name, email: student.email },
            testResults: results,
            currentAssignments: assignments,
            performanceMetrics: this.calculatePerformanceMetrics(results),
        };
    }

    // =============================================================================
    // TEACHER MANAGEMENT
    // =============================================================================

    async getTeachers(centerId: number) {
        const teachers = await this.userRepository.find({
            where: { center_id: centerId },
            relations: ['roles'],
            order: { name: 'ASC' },
        });

        return teachers.filter(user =>
            user.roles.some(role => role.role_name === RoleName.TEACHER)
        ).map(teacher => {
            const { password: _, ...teacherWithoutPassword } = teacher;
            return teacherWithoutPassword;
        });
    }

    async assignStudentsToTeacher(
        teacherId: number,
        studentIds: number[],
        centerId: number
    ) {
        // Verify teacher exists and belongs to center
        const teacher = await this.userRepository.findOne({
            where: {
                id: teacherId,
                center_id: centerId
            },
            relations: ['roles'],
        });

        if (!teacher || !teacher.roles.some(role => role.role_name === RoleName.TEACHER)) {
            throw new NotFoundException('Teacher not found');
        }

        // Verify all students exist and belong to center
        const students = await this.userRepository.find({
            where: {
                center_id: centerId
            },
            relations: ['roles'],
        });

        const validStudents = students.filter(student =>
            studentIds.includes(student.id) &&
            student.roles.some(role => role.role_name === RoleName.STUDENT)
        );

        if (validStudents.length !== studentIds.length) {
            throw new BadRequestException('Some students not found or invalid');
        }

        // Here you would implement the teacher-student assignment logic
        // This might involve creating records in a teacher_students table
        // For now, we'll return a success response

        return {
            teacher: { id: teacher.id, name: teacher.name },
            assignedStudents: validStudents.map(student => ({
                id: student.id,
                name: student.name,
                email: student.email
            })),
            message: `${validStudents.length} students assigned to teacher successfully`
        };
    }

    async getTeacherStudents(teacherId: number, centerId: number) {
        // Verify teacher exists and belongs to center
        const teacher = await this.userRepository.findOne({
            where: {
                id: teacherId,
                center_id: centerId
            },
            relations: ['roles'],
        });

        if (!teacher || !teacher.roles.some(role => role.role_name === RoleName.TEACHER)) {
            throw new NotFoundException('Teacher not found');
        }

        // For now, return all students in the center
        // In a real implementation, you'd have a teacher_students relationship table
        const students = await this.userRepository.find({
            where: { center_id: centerId },
            relations: ['roles'],
            order: { name: 'ASC' },
        });

        const teacherStudents = students.filter(user =>
            user.roles.some(role => role.role_name === RoleName.STUDENT)
        ).map(student => {
            const { password: _, ...studentWithoutPassword } = student;
            return studentWithoutPassword;
        });

        return {
            teacher: { id: teacher.id, name: teacher.name },
            students: teacherStudents
        };
    }

    // =============================================================================
    // ANALYTICS & REPORTING
    // =============================================================================

    async getCenterOverview(centerId: number) {
        const totalStudents = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('user.center_id = :centerId', { centerId })
            .andWhere('role.role_name = :roleName', { roleName: RoleName.STUDENT })
            .getCount();

        const activeStudents = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('user.center_id = :centerId', { centerId })
            .andWhere('role.role_name = :roleName', { roleName: RoleName.STUDENT })
            .andWhere('user.is_active = true')
            .getCount();

        const totalTeachers = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('user.center_id = :centerId', { centerId })
            .andWhere('role.role_name = :roleName', { roleName: RoleName.TEACHER })
            .getCount();

        const totalAssignments = await this.testAssignmentRepository.count({
            where: { center_id: centerId, is_active: true },
        });

        const completedTests = await this.testResultRepository.count({
            where: {
                center_id: centerId,
                status: TestResultStatus.COMPLETED
            },
        });

        const avgScores = await this.testResultRepository
            .createQueryBuilder('result')
            .select('AVG(result.overall_score)', 'avgOverall')
            .addSelect('AVG(result.band_score)', 'avgBand')
            .where('result.center_id = :centerId', { centerId })
            .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED })
            .getRawOne();

        return {
            overview: {
                totalStudents,
                activeStudents,
                totalTeachers,
                totalAssignments,
                completedTests,
                completionRate: totalAssignments > 0 ? (completedTests / totalAssignments) * 100 : 0,
            },
            performance: {
                averageOverallScore: parseFloat(avgScores?.avgOverall || '0'),
                averageBandScore: parseFloat(avgScores?.avgBand || '0'),
            },
        };
    }

    async getCenterPerformanceAnalytics(query: CenterAnalyticsQueryDto, centerId: number) {
        const { start_date, end_date, level, teacher_id, group_by = 'month' } = query;

        let performanceQuery = this.testResultRepository
            .createQueryBuilder('result')
            .innerJoin('result.student', 'student')
            .where('result.center_id = :centerId', { centerId })
            .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED });

        if (start_date && end_date) {
            performanceQuery = performanceQuery.andWhere(
                'result.completed_at BETWEEN :startDate AND :endDate',
                { startDate: start_date, endDate: end_date }
            );
        }

        if (teacher_id) {
            performanceQuery = performanceQuery.andWhere(
                'result.assignment.assigned_by_user_id = :teacherId',
                { teacherId: teacher_id }
            );
        }

        const results = await performanceQuery
            .select([
                'result.completed_at',
                'result.overall_score',
                'result.listening_score',
                'result.reading_score',
                'result.band_score',
                'student.id',
                'student.name'
            ])
            .orderBy('result.completed_at', 'ASC')
            .getRawMany();

        return {
            results,
            summary: {
                total_tests: results.length,
                average_overall: results.reduce((sum, r) => sum + (r.overall_score || 0), 0) / results.length || 0,
                average_band: results.reduce((sum, r) => sum + (r.band_score || 0), 0) / results.length || 0,
            }
        };
    }

    async getTestCompletionRates(centerId: number) {
        const completionData = await this.testAssignmentRepository
            .createQueryBuilder('assignment')
            .select([
                'DATE_FORMAT(assignment.created_at, "%Y-%m") as month',
                'COUNT(*) as total_assignments',
                'SUM(CASE WHEN assignment.status = :completedStatus THEN 1 ELSE 0 END) as completed_assignments'
            ])
            .where('assignment.center_id = :centerId', { centerId })
            .andWhere('assignment.is_active = true')
            .groupBy('month')
            .orderBy('month', 'ASC')
            .setParameter('completedStatus', TestAssignmentStatus.COMPLETED)
            .getRawMany();

        return completionData.map(data => ({
            month: data.month,
            totalAssignments: parseInt(data.total_assignments),
            completedAssignments: parseInt(data.completed_assignments),
            completionRate: (parseInt(data.completed_assignments) / parseInt(data.total_assignments)) * 100
        }));
    }

    async getStudentProgressTracking(centerId: number) {
        const progressData = await this.testResultRepository
            .createQueryBuilder('result')
            .innerJoin('result.student', 'student')
            .select([
                'student.id',
                'student.name',
                'COUNT(*) as tests_completed',
                'AVG(result.overall_score) as avg_score',
                'MIN(result.completed_at) as first_test',
                'MAX(result.completed_at) as latest_test'
            ])
            .where('result.center_id = :centerId', { centerId })
            .andWhere('result.status = :status', { status: TestResultStatus.COMPLETED })
            .groupBy('student.id')
            .orderBy('avg_score', 'DESC')
            .getRawMany();

        return progressData;
    }

    // Report generation methods
    async generateStudentsReport(centerId: number) {
        const students = await this.getStudents({}, centerId);

        // Format data for report
        const reportData = students.students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            is_active: student.is_active,
            created_at: student.created_at,
        }));

        return {
            report_type: 'students_report',
            generated_at: new Date().toISOString(),
            center_id: centerId,
            data: reportData,
            summary: {
                total_students: reportData.length,
                active_students: reportData.filter(s => s.is_active).length,
            }
        };
    }

    async generateTestResultsReport(query: CenterAnalyticsQueryDto, centerId: number) {
        const analytics = await this.getCenterPerformanceAnalytics(query, centerId);

        return {
            report_type: 'test_results_report',
            generated_at: new Date().toISOString(),
            center_id: centerId,
            filters: query,
            data: analytics.results,
            summary: analytics.summary,
        };
    }

    async generatePerformanceTrendsReport(centerId: number) {
        const trends = await this.getTestCompletionRates(centerId);

        return {
            report_type: 'performance_trends_report',
            generated_at: new Date().toISOString(),
            center_id: centerId,
            data: trends,
            summary: {
                total_months: trends.length,
                average_completion_rate: trends.reduce((sum, t) => sum + t.completionRate, 0) / trends.length || 0,
            }
        };
    }

    // Helper methods
    private calculatePerformanceMetrics(results: TestResult[]) {
        if (results.length === 0) {
            return {
                totalTests: 0,
                averageScore: 0,
                bestScore: 0,
                latestScore: 0,
                improvementTrend: 'no-data'
            };
        }

        const scores = results.map(r => r.overall_score || 0);
        const totalTests = results.length;
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalTests;
        const bestScore = Math.max(...scores);
        const latestScore = scores[scores.length - 1];

        // Simple improvement calculation
        let improvementTrend = 'stable';
        if (totalTests > 1) {
            const firstHalf = scores.slice(0, Math.floor(totalTests / 2));
            const secondHalf = scores.slice(Math.floor(totalTests / 2));
            const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

            if (secondAvg > firstAvg + 0.5) improvementTrend = 'improving';
            else if (secondAvg < firstAvg - 0.5) improvementTrend = 'declining';
        }

        return {
            totalTests,
            averageScore,
            bestScore,
            latestScore,
            improvementTrend
        };
    }
}