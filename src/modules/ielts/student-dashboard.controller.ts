import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentDashboardService } from './student-dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName } from '../../entities';

@ApiTags('Student Dashboard')
@Controller('student/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentDashboardController {
  constructor(private readonly studentDashboardService: StudentDashboardService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get student dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getStudentDashboard(
    @GetUser('sub') studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.studentDashboardService.getStudentDashboard(studentId, centerId);
  }

  @Get('available-tests')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get available tests for self-assignment' })
  @ApiResponse({ status: 200, description: 'Available tests retrieved successfully' })
  async getAvailableTests(
    @GetUser('sub') studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.studentDashboardService.getAvailableTests(studentId, centerId);
  }

  @Post('self-assign/:testId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Self-assign a test (for individual practice)' })
  @ApiResponse({ status: 201, description: 'Test self-assigned successfully' })
  async selfAssignTest(
    @Param('testId', ParseIntPipe) testId: number,
    @GetUser('sub') studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.studentDashboardService.selfAssignTest(studentId, testId, centerId);
  }

  @Get('test-history')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get complete test history' })
  @ApiResponse({ status: 200, description: 'Test history retrieved successfully' })
  async getTestHistory(
    @GetUser('sub') studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.studentDashboardService.getTestHistory(studentId, centerId);
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get personal performance analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getPersonalAnalytics(
    @GetUser('sub') studentId: number,
    @GetTenant() centerId: number,
  ) {
    return await this.studentDashboardService.getPersonalAnalytics(studentId, centerId);
  }
}