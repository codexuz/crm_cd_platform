import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
} from './dto/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../entities';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: 201,
    description: 'Attendance record created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Attendance record already exists or bad request',
  })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('bulk')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Create multiple attendance records at once' })
  @ApiResponse({
    status: 201,
    description: 'Attendance records created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or attendance records already exist',
  })
  bulkCreate(@Body() bulkCreateDto: BulkCreateAttendanceDto) {
    return this.attendanceService.bulkCreate(bulkCreateDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'groupId', required: false, type: 'string' })
  @ApiQuery({ name: 'studentId', required: false, type: 'string' })
  @ApiQuery({ name: 'teacherId', required: false, type: 'string' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Format: YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'Format: YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
  })
  findAll(
    @Query('centerId') centerId?: string,
    @Query('groupId') groupId?: string,
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAll(
      centerId,
      groupId,
      studentId,
      teacherId,
      startDate,
      endDate,
    );
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiQuery({ name: 'groupId', required: false, type: 'string' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Format: YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'Format: YYYY-MM-DD',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance statistics retrieved successfully',
  })
  getStats(
    @Query('groupId') groupId?: string,
    @Query('centerId') centerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getAttendanceStats(
      groupId,
      centerId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update attendance record' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({
    status: 200,
    description: 'Attendance record deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
