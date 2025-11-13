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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequiresModules } from '../../common/decorators/subscription.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName, PaymentStatus } from '../../entities';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard, ModuleAccessGuard)
@RequiresModules('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiResponse({
    status: 201,
    description: 'Payment record created successfully',
  })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all payment records' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiResponse({
    status: 200,
    description: 'Payment records retrieved successfully',
  })
  findAll(
    @Query('centerId') centerId?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.findAll(centerId, status);
  }

  @Get('my-payments')
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get current user payment records' })
  @ApiResponse({
    status: 200,
    description: 'User payment records retrieved successfully',
  })
  findMyPayments(@GetUser('userId') userId: string) {
    return this.paymentsService.findByStudent(userId);
  }

  @Get('date-range')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get payments within date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: 'string',
    description: 'Format: YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: 'string',
    description: 'Format: YYYY-MM-DD',
  })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Payments within date range retrieved successfully',
  })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.paymentsService.findByDateRange(startDate, endDate, centerId);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({
    name: 'month',
    required: false,
    type: 'string',
    description: 'Format: YYYY-MM',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
  })
  getStats(
    @Query('centerId') centerId?: string,
    @Query('month') month?: string,
  ) {
    return this.paymentsService.getPaymentStats(centerId, month);
  }

  @Get('student/:studentId')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get payment records for specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student payment records retrieved successfully',
  })
  findByStudent(@Param('studentId') studentId: string) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment record retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update payment record' })
  @ApiResponse({
    status: 200,
    description: 'Payment record updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Delete payment record' })
  @ApiResponse({
    status: 200,
    description: 'Payment record deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
