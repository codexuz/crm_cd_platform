import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsString,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiProperty({
    example: SubscriptionPlan.PRO,
    description: 'Subscription plan type',
    enum: SubscriptionPlan,
  })
  @IsEnum(SubscriptionPlan)
  plan_type: SubscriptionPlan;

  @ApiPropertyOptional({
    example: SubscriptionStatus.ACTIVE,
    description: 'Subscription status',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({
    example: '2025-11-13',
    description: 'Subscription start date (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    example: '2026-11-13',
    description: 'Subscription end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: '2025-11-27',
    description: 'Trial end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  trial_end_date?: string;

  @ApiPropertyOptional({
    example: 99.99,
    description: 'Subscription price',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency code',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'monthly',
    description: 'Billing cycle: monthly, yearly, lifetime',
    default: 'monthly',
  })
  @IsOptional()
  @IsString()
  billing_cycle?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Auto-renew subscription',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;

  @ApiPropertyOptional({
    example: {
      max_users: 50,
      max_students: 500,
      max_groups: 20,
      enabled_modules: ['leads', 'payments', 'salary'],
      priority_support: true,
    },
    description: 'Plan features',
  })
  @IsOptional()
  @IsObject()
  features?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Promotional discount applied',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    example: SubscriptionPlan.ENTERPRISE,
    description: 'Subscription plan type',
    enum: SubscriptionPlan,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan_type?: SubscriptionPlan;

  @ApiPropertyOptional({
    example: SubscriptionStatus.ACTIVE,
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    example: '2026-11-13',
    description: 'Subscription end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    example: 199.99,
    description: 'Subscription price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: 'yearly',
    description: 'Billing cycle: monthly, yearly, lifetime',
  })
  @IsOptional()
  @IsString()
  billing_cycle?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Auto-renew subscription',
  })
  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;

  @ApiPropertyOptional({
    example: {
      max_users: 100,
      max_students: 1000,
      priority_support: true,
      api_access: true,
    },
    description: 'Plan features',
  })
  @IsOptional()
  @IsObject()
  features?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Upgraded to enterprise plan',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpgradeSubscriptionDto {
  @ApiProperty({
    example: SubscriptionPlan.ENTERPRISE,
    description: 'New subscription plan',
    enum: SubscriptionPlan,
  })
  @IsEnum(SubscriptionPlan)
  new_plan: SubscriptionPlan;

  @ApiPropertyOptional({
    example: 'yearly',
    description: 'New billing cycle',
  })
  @IsOptional()
  @IsString()
  billing_cycle?: string;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({
    example: 'Switching to another platform',
    description: 'Cancellation reason',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Cancel immediately or at end of billing period',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  immediate?: boolean;
}
