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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from './dto/subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../entities';
import { SubscriptionStatus } from '../../entities/subscription.entity';
import { InvoiceStatus } from '../../entities/invoice.entity';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ==================== Subscription Plans ====================

  @Post('plans')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan created successfully',
  })
  createPlan(@Body() createPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(createPlanDto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiQuery({ name: 'activeOnly', required: false, type: 'boolean' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
  })
  getAllPlans(@Query('activeOnly') activeOnly?: boolean) {
    return this.subscriptionsService.getAllPlans(activeOnly !== false);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  getPlanById(@Param('id') id: string) {
    return this.subscriptionsService.getPlanById(id);
  }

  @Patch('plans/:id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionsService.updatePlan(id, updatePlanDto);
  }

  @Delete('plans/:id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Delete subscription plan (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete plan with active subscriptions',
  })
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id);
  }

  // ==================== Subscriptions ====================

  @Post()
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Center already has an active subscription',
  })
  createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(createSubscriptionDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriptionStatus })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  getAllSubscriptions(
    @Query('centerId') centerId?: string,
    @Query('status') status?: SubscriptionStatus,
  ) {
    return this.subscriptionsService.getAllSubscriptions(centerId, status);
  }

  @Get('center/:centerId/active')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get active subscription for a center' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Active subscription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  getActiveByCenterId(@Param('centerId') centerId: string) {
    return this.subscriptionsService.getActiveByCenterId(centerId);
  }

  @Get('center/:centerId/module-access/:moduleName')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Check if center has access to a module' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'moduleName', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Module access checked successfully',
  })
  async hasModuleAccess(
    @Param('centerId') centerId: string,
    @Param('moduleName') moduleName: string,
  ) {
    const hasAccess = await this.subscriptionsService.hasModuleAccess(
      centerId,
      moduleName,
    );
    return { hasAccess, moduleName };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  getSubscriptionById(@Param('id') id: string) {
    return this.subscriptionsService.getSubscriptionById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  updateSubscription(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(
      id,
      updateSubscriptionDto,
    );
  }

  @Patch(':id/cancel')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiQuery({
    name: 'immediate',
    required: false,
    type: 'boolean',
    description: 'Cancel immediately or at period end',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  cancelSubscription(
    @Param('id') id: string,
    @Query('immediate') immediate?: boolean,
  ) {
    return this.subscriptionsService.cancelSubscription(id, immediate);
  }

  @Patch(':id/renew')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Renew subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  renewSubscription(@Param('id') id: string) {
    return this.subscriptionsService.renewSubscription(id);
  }

  @Post('check-expired')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Check and update expired subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Expired subscriptions checked and updated',
  })
  checkExpiredSubscriptions() {
    return this.subscriptionsService.checkExpiredSubscriptions();
  }

  // ==================== Invoices ====================

  @Post('invoices')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
  })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.subscriptionsService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'subscriptionId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  getAllInvoices(
    @Query('centerId') centerId?: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.subscriptionsService.getAllInvoices(
      centerId,
      subscriptionId,
      status,
    );
  }

  @Get('invoices/:id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoiceById(@Param('id') id: string) {
    return this.subscriptionsService.getInvoiceById(id);
  }

  @Patch('invoices/:id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.subscriptionsService.updateInvoice(id, updateInvoiceDto);
  }

  @Patch('invoices/:id/mark-paid')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiQuery({ name: 'transactionId', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Invoice marked as paid successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  markInvoiceAsPaid(
    @Param('id') id: string,
    @Query('transactionId') transactionId: string,
  ) {
    return this.subscriptionsService.markInvoiceAsPaid(id, transactionId);
  }
}
