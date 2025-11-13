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
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
} from './dto/subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../entities';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../entities/subscription.entity';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

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
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriptionStatus })
  @ApiQuery({ name: 'plan', required: false, enum: SubscriptionPlan })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  findAll(
    @Query('centerId') centerId?: string,
    @Query('status') status?: SubscriptionStatus,
    @Query('plan') plan?: SubscriptionPlan,
  ) {
    return this.subscriptionsService.findAll(centerId, status, plan);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStats() {
    return this.subscriptionsService.getSubscriptionStats();
  }

  @Get('plans/:plan/features')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Get features for a specific plan' })
  @ApiParam({ name: 'plan', enum: SubscriptionPlan })
  @ApiResponse({
    status: 200,
    description: 'Plan features retrieved successfully',
  })
  getPlanFeatures(@Param('plan') plan: SubscriptionPlan) {
    return this.subscriptionsService.getPlanFeatures(plan);
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
  findActiveByCenter(@Param('centerId') centerId: string) {
    return this.subscriptionsService.findActiveByCenter(centerId);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Patch('center/:centerId/upgrade')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription upgraded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Can only upgrade to a higher plan',
  })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  upgrade(
    @Param('centerId') centerId: string,
    @Body() upgradeDto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgrade(centerId, upgradeDto);
  }

  @Patch('center/:centerId/downgrade/:newPlan')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Downgrade subscription plan' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'newPlan', enum: SubscriptionPlan })
  @ApiResponse({
    status: 200,
    description: 'Subscription downgraded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Can only downgrade to a lower plan',
  })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  downgrade(
    @Param('centerId') centerId: string,
    @Param('newPlan') newPlan: SubscriptionPlan,
  ) {
    return this.subscriptionsService.downgrade(centerId, newPlan);
  }

  @Patch('center/:centerId/cancel')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  cancel(
    @Param('centerId') centerId: string,
    @Body() cancelDto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancel(centerId, cancelDto);
  }

  @Patch(':id/renew')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Renew expired subscription' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: 'number',
    description: 'Renewal period in days (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription renewed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Only expired subscriptions can be renewed',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  renew(@Param('id') id: string, @Query('days') days?: number) {
    return this.subscriptionsService.renew(id, days);
  }

  @Post('check-expired')
  @Roles(RoleName.ADMIN)
  @ApiOperation({
    summary: 'Check and update expired subscriptions (admin task)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired subscriptions updated successfully',
  })
  async checkExpired() {
    const count = await this.subscriptionsService.checkAndUpdateExpired();
    return {
      message: 'Expired subscriptions updated',
      updated: count,
    };
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
