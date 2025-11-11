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
import { TestAssignmentService } from './test-assignment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName } from '../../entities';
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

@ApiTags('Test Assignments & Results')
@Controller('ielts/assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestAssignmentController {
  constructor(private readonly testAssignmentService: TestAssignmentService) {}

  // =============================================================================
  // ASSIGNMENT MANAGEMENT (Centers/Teachers/Managers)
  // =============================================================================

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Assign a test to a student' })
  @ApiResponse({ status: 201, description: 'Test assigned successfully' })
  async assignTest(
    @Body() createAssignmentDto: CreateTestAssignmentDto,
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.testAssignmentService.assignTest(
      createAssignmentDto,
      centerId,
      userId,
    );
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Assign a test to multiple students' })
  @ApiResponse({ status: 201, description: 'Test assigned to multiple students successfully' })
  async bulkAssignTest(
    @Body() bulkAssignDto: BulkAssignTestDto,
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.testAssignmentService.bulkAssignTest(
      bulkAssignDto,
      centerId,
      userId,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER, RoleName.STUDENT)
  @ApiOperation({ summary: 'Get test assignments (filtered by role)' })
  @ApiResponse({ status: 200, description: 'Test assignments retrieved successfully' })
  async getAssignments(
    @Query() query: GetAssignmentsQueryDto,
    @GetTenant() centerId: number,
    @GetUser('roles') userRoles: RoleName[],
    @GetUser('sub') userId: number,
  ) {
    return await this.testAssignmentService.getAssignments(
      query,
      centerId,
      userRoles,
      userId,
    );
  }

  @Get('my-assignments')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get my test assignments (students only)' })
  @ApiResponse({ status: 200, description: 'Student assignments retrieved successfully' })
  async getMyAssignments(
    @GetTenant() centerId: number,
    @GetUser('sub') studentId: number,
  ) {
    return await this.testAssignmentService.getMyAssignments(studentId, centerId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update test assignment' })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
  async updateAssignment(
    @Param('id', ParseIntPipe) assignmentId: number,
    @Body() updateDto: UpdateTestAssignmentDto,
    @GetTenant() centerId: number,
  ) {
    return await this.testAssignmentService.updateAssignment(
      assignmentId,
      updateDto,
      centerId,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Cancel test assignment' })
  @ApiResponse({ status: 200, description: 'Assignment cancelled successfully' })
  async deleteAssignment(
    @Param('id', ParseIntPipe) assignmentId: number,
    @GetTenant() centerId: number,
  ) {
    await this.testAssignmentService.deleteAssignment(assignmentId, centerId);
    return { message: 'Assignment cancelled successfully' };
  }

  // =============================================================================
  // TEST TAKING (Students)
  // =============================================================================

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Start taking a test' })
  @ApiResponse({ status: 201, description: 'Test started successfully' })
  async startTest(
    @Body() startTestDto: StartTestDto,
    @GetTenant() centerId: number,
    @GetUser('sub') studentId: number,
  ) {
    return await this.testAssignmentService.startTest(
      startTestDto,
      studentId,
      centerId,
    );
  }

  @Post('submit')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Submit test answers (can be partial or final)' })
  @ApiResponse({ status: 200, description: 'Answers submitted successfully' })
  async submitAnswers(
    @Body() submitDto: SubmitAnswersDto,
    @GetUser('sub') studentId: number,
  ) {
    return await this.testAssignmentService.submitAnswers(submitDto, studentId);
  }

  @Post('complete')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Complete and submit final test answers' })
  @ApiResponse({ status: 200, description: 'Test completed successfully' })
  async completeTest(
    @Body() completeDto: CompleteTestDto,
    @GetUser('sub') studentId: number,
  ) {
    return await this.testAssignmentService.completeTest(completeDto, studentId);
  }

  // =============================================================================
  // GRADING & REVIEW (Teachers/Managers)
  // =============================================================================

  @Post('grade')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Grade a completed test' })
  @ApiResponse({ status: 200, description: 'Test graded successfully' })
  async gradeTest(
    @Body() gradeDto: GradeTestDto,
    @GetTenant() centerId: number,
    @GetUser('sub') teacherId: number,
  ) {
    return await this.testAssignmentService.gradeTest(gradeDto, centerId, teacherId);
  }

  @Get('results')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER, RoleName.STUDENT)
  @ApiOperation({ summary: 'Get test results (filtered by role)' })
  @ApiResponse({ status: 200, description: 'Test results retrieved successfully' })
  async getTestResults(
    @Query() query: GetResultsQueryDto,
    @GetTenant() centerId: number,
    @GetUser('roles') userRoles: RoleName[],
    @GetUser('sub') userId: number,
  ) {
    return await this.testAssignmentService.getTestResults(
      query,
      centerId,
      userRoles,
      userId,
    );
  }

  @Get('results/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER, RoleName.STUDENT)
  @ApiOperation({ summary: 'Get detailed test result by ID' })
  @ApiResponse({ status: 200, description: 'Test result retrieved successfully' })
  async getTestResultById(
    @Param('id', ParseIntPipe) resultId: number,
    @GetTenant() centerId: number,
    @GetUser('roles') userRoles: RoleName[],
    @GetUser('sub') userId: number,
  ) {
    return await this.testAssignmentService.getTestResultById(
      resultId,
      centerId,
      userRoles,
      userId,
    );
  }

  // =============================================================================
  // ANALYTICS & REPORTING (Centers/Managers)
  // =============================================================================

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get center test statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getCenterStatistics(@GetTenant() centerId: number) {
    return await this.testAssignmentService.getCenterStatistics(centerId);
  }
}