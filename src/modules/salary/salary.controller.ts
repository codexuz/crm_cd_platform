import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { CreateTeacherSalaryDto, UpdateTeacherSalaryDto, MarkSalaryPaidDto } from './dto/salary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName, SalaryStatus } from '../../entities';

@ApiTags('Salary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new salary record' })
  @ApiResponse({ status: 201, description: 'Salary record created successfully' })
  @ApiResponse({ status: 400, description: 'Salary record already exists for this month' })
  create(@Body() createSalaryDto: CreateTeacherSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all salary records' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiQuery({ name: 'status', required: false, enum: SalaryStatus })
  @ApiQuery({ name: 'month', required: false, type: 'string', description: 'Format: YYYY-MM' })
  @ApiResponse({ status: 200, description: 'Salary records retrieved successfully' })
  findAll(
    @Query('centerId') centerId?: number,
    @Query('status') status?: SalaryStatus,
    @Query('month') month?: string,
  ) {
    return this.salaryService.findAll(centerId, status, month);
  }

  @Get('my-salary')
  @Roles(RoleName.TEACHER)
  @ApiOperation({ summary: 'Get current teacher salary records' })
  @ApiQuery({ name: 'year', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Teacher salary records retrieved successfully' })
  getMysalary(
    @GetUser('userId') teacherId: number,
    @Query('year') year?: number,
  ) {
    return this.salaryService.findByTeacher(teacherId, year);
  }

  @Get('my-summary')
  @Roles(RoleName.TEACHER)
  @ApiOperation({ summary: 'Get current teacher salary summary' })
  @ApiQuery({ name: 'year', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Teacher salary summary retrieved successfully' })
  getMySalarySummary(
    @GetUser('userId') teacherId: number,
    @Query('year') year?: number,
  ) {
    return this.salaryService.getTeacherSalarySummary(teacherId, year);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get salary statistics' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiQuery({ name: 'year', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Salary statistics retrieved successfully' })
  getStats(
    @Query('centerId') centerId?: number,
    @Query('year') year?: number,
  ) {
    return this.salaryService.getSalaryStats(centerId, year);
  }

  @Post('generate-monthly')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Generate monthly salaries for all teachers in a center' })
  @ApiResponse({ status: 201, description: 'Monthly salaries generated successfully' })
  generateMonthlySalaries(
    @Body() body: { centerId: number; month: string; hourlyRate?: number },
  ) {
    return this.salaryService.generateMonthlySalaries(
      body.centerId,
      body.month,
      body.hourlyRate || 25,
    );
  }

  @Get('teacher/:teacherId')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get salary records for specific teacher' })
  @ApiQuery({ name: 'year', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Teacher salary records retrieved successfully' })
  findByTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Query('year') year?: number,
  ) {
    return this.salaryService.findByTeacher(teacherId, year);
  }

  @Get('teacher/:teacherId/summary')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get salary summary for specific teacher' })
  @ApiQuery({ name: 'year', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Teacher salary summary retrieved successfully' })
  getTeacherSummary(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Query('year') year?: number,
  ) {
    return this.salaryService.getTeacherSalarySummary(teacherId, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary record by ID' })
  @ApiResponse({ status: 200, description: 'Salary record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update salary record' })
  @ApiResponse({ status: 200, description: 'Salary record updated successfully' })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryDto: UpdateTeacherSalaryDto,
  ) {
    return this.salaryService.update(id, updateSalaryDto);
  }

  @Patch(':id/mark-paid')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Mark salary as paid' })
  @ApiResponse({ status: 200, description: 'Salary marked as paid successfully' })
  @ApiResponse({ status: 400, description: 'Salary already marked as paid' })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() markPaidDto: MarkSalaryPaidDto,
  ) {
    return this.salaryService.markAsPaid(id, markPaidDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Delete salary record' })
  @ApiResponse({ status: 200, description: 'Salary record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.remove(id);
  }
}