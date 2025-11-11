import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName } from '../../entities';
import { CenterManagementService } from './center-management.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  BulkCreateStudentsDto,
  GetStudentsQueryDto,
  AssignTeacherDto,
  CenterAnalyticsQueryDto,
} from './dto/center-management.dto';

@ApiTags('Center Management (CRM)')
@Controller('center/management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.MANAGER)
@ApiBearerAuth()
export class CenterManagementController {
  constructor(private readonly centerManagementService: CenterManagementService) {}

  // =============================================================================
  // STUDENT MANAGEMENT
  // =============================================================================

  @Get('students')
  @ApiOperation({ summary: 'Get all students in the center' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  async getStudents(
    @Query() query: GetStudentsQueryDto,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.getStudents(query, centerId);
  }

  @Post('students')
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @GetTenant() centerId: number,
    @GetUser('sub') createdByUserId: number,
  ) {
    return await this.centerManagementService.createStudent(
      createStudentDto,
      centerId,
      createdByUserId,
    );
  }

  @Post('students/bulk')
  @ApiOperation({ summary: 'Create multiple students at once' })
  @ApiResponse({ status: 201, description: 'Students created successfully' })
  async bulkCreateStudents(
    @Body() bulkCreateDto: BulkCreateStudentsDto,
    @GetTenant() centerId: number,
    @GetUser('sub') createdByUserId: number,
  ) {
    return await this.centerManagementService.bulkCreateStudents(
      bulkCreateDto,
      centerId,
      createdByUserId,
    );
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'Get student details by ID' })
  @ApiResponse({ status: 200, description: 'Student details retrieved successfully' })
  async getStudentById(
    @Param('id', ParseIntPipe) studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.getStudentById(studentId, centerId);
  }

  @Put('students/:id')
  @ApiOperation({ summary: 'Update student information' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  async updateStudent(
    @Param('id', ParseIntPipe) studentId: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.updateStudent(
      studentId,
      updateStudentDto,
      centerId,
    );
  }

  @Delete('students/:id')
  @Roles(RoleName.ADMIN) // Only admins can delete students
  @ApiOperation({ summary: 'Deactivate/delete a student' })
  @ApiResponse({ status: 200, description: 'Student deactivated successfully' })
  async deleteStudent(
    @Param('id', ParseIntPipe) studentId: number,
    @GetTenant() centerId: number,
  ) {
    await this.centerManagementService.deleteStudent(studentId, centerId);
    return { message: 'Student deactivated successfully' };
  }

  @Get('students/:id/performance')
  @ApiOperation({ summary: 'Get detailed student performance analytics' })
  @ApiResponse({ status: 200, description: 'Student performance retrieved successfully' })
  async getStudentPerformance(
    @Param('id', ParseIntPipe) studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.getStudentPerformance(studentId, centerId);
  }

  // =============================================================================
  // TEACHER MANAGEMENT
  // =============================================================================

  @Get('teachers')
  @ApiOperation({ summary: 'Get all teachers in the center' })
  @ApiResponse({ status: 200, description: 'Teachers retrieved successfully' })
  async getTeachers(@GetTenant() centerId: number) {
    return await this.centerManagementService.getTeachers(centerId);
  }

  @Post('teachers/:teacherId/assign-students')
  @ApiOperation({ summary: 'Assign students to a teacher' })
  @ApiResponse({ status: 200, description: 'Students assigned to teacher successfully' })
  async assignStudentsToTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Body() assignDto: AssignTeacherDto,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.assignStudentsToTeacher(
      teacherId,
      assignDto.student_ids,
      centerId,
    );
  }

  @Get('teachers/:id/students')
  @ApiOperation({ summary: 'Get students assigned to a specific teacher' })
  @ApiResponse({ status: 200, description: 'Teacher students retrieved successfully' })
  async getTeacherStudents(
    @Param('id', ParseIntPipe) teacherId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.getTeacherStudents(teacherId, centerId);
  }

  // =============================================================================
  // ANALYTICS & REPORTING
  // =============================================================================

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get center overview analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getCenterOverview(@GetTenant() centerId: number) {
    return await this.centerManagementService.getCenterOverview(centerId);
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get center performance analytics' })
  @ApiResponse({ status: 200, description: 'Performance analytics retrieved successfully' })
  async getCenterPerformanceAnalytics(
    @Query() query: CenterAnalyticsQueryDto,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.getCenterPerformanceAnalytics(query, centerId);
  }

  @Get('analytics/test-completion-rates')
  @ApiOperation({ summary: 'Get test completion rates by time period' })
  @ApiResponse({ status: 200, description: 'Completion rates retrieved successfully' })
  async getTestCompletionRates(@GetTenant() centerId: number) {
    return await this.centerManagementService.getTestCompletionRates(centerId);
  }

  @Get('analytics/student-progress')
  @ApiOperation({ summary: 'Get student progress tracking' })
  @ApiResponse({ status: 200, description: 'Student progress retrieved successfully' })
  async getStudentProgressTracking(@GetTenant() centerId: number) {
    return await this.centerManagementService.getStudentProgressTracking(centerId);
  }

  // =============================================================================
  // REPORTS & EXPORTS
  // =============================================================================

  @Get('reports/students')
  @ApiOperation({ summary: 'Generate students report' })
  @ApiResponse({ status: 200, description: 'Students report generated successfully' })
  async generateStudentsReport(@GetTenant() centerId: number) {
    return await this.centerManagementService.generateStudentsReport(centerId);
  }

  @Get('reports/test-results')
  @ApiOperation({ summary: 'Generate test results report' })
  @ApiResponse({ status: 200, description: 'Test results report generated successfully' })
  async generateTestResultsReport(
    @Query() query: CenterAnalyticsQueryDto,
    @GetTenant() centerId: number,
  ) {
    return await this.centerManagementService.generateTestResultsReport(query, centerId);
  }

  @Get('reports/performance-trends')
  @ApiOperation({ summary: 'Generate performance trends report' })
  @ApiResponse({ status: 200, description: 'Performance trends report generated successfully' })
  async generatePerformanceTrendsReport(@GetTenant() centerId: number) {
    return await this.centerManagementService.generatePerformanceTrendsReport(centerId);
  }
}