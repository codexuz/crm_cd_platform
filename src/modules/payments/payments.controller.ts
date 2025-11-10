import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName, PaymentStatus } from '../../entities';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiResponse({ status: 201, description: 'Payment record created successfully' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all payment records' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiResponse({ status: 200, description: 'Payment records retrieved successfully' })
  findAll(
    @Query('centerId') centerId?: number,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.findAll(centerId, status);
  }

  @Get('my-payments')
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get current user payment records' })
  @ApiResponse({ status: 200, description: 'User payment records retrieved successfully' })
  findMyPayments(@GetUser('userId') userId: number) {
    return this.paymentsService.findByStudent(userId);
  }

  @Get('date-range')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get payments within date range' })
  @ApiQuery({ name: 'startDate', required: true, type: 'string', description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, type: 'string', description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Payments within date range retrieved successfully' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('centerId') centerId?: number,
  ) {
    return this.paymentsService.findByDateRange(startDate, endDate, centerId);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiQuery({ name: 'month', required: false, type: 'string', description: 'Format: YYYY-MM' })
  @ApiResponse({ status: 200, description: 'Payment statistics retrieved successfully' })
  getStats(
    @Query('centerId') centerId?: number,
    @Query('month') month?: string,
  ) {
    return this.paymentsService.getPaymentStats(centerId, month);
  }

  @Get('student/:studentId')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get payment records for specific student' })
  @ApiResponse({ status: 200, description: 'Student payment records retrieved successfully' })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment record by ID' })
  @ApiResponse({ status: 200, description: 'Payment record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update payment record' })
  @ApiResponse({ status: 200, description: 'Payment record updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Delete payment record' })
  @ApiResponse({ status: 200, description: 'Payment record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}