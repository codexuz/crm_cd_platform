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
import { SubscriptionStatus } from '../../../entities/subscription.entity';
import {
  InvoiceStatus,
  PaymentProvider,
} from '../../../entities/invoice.entity';

// Subscription Plan DTOs
export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Pro Plan', description: 'Plan name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 49.99,
    description: 'Monthly price',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price_month: number;

  @ApiProperty({
    example: 499.99,
    description: 'Yearly price',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price_year: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency (UZS/USD)',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'Professional plan with all features',
    description: 'Plan description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      leads: true,
      groups: true,
      payments: true,
      salary: true,
      attendance: true,
      ielts: false,
      max_users: 10,
      max_students: 100,
    },
    description: 'Plan features configuration',
  })
  @IsNotEmpty()
  @IsObject()
  features: {
    leads?: boolean;
    groups?: boolean;
    payments?: boolean;
    salary?: boolean;
    attendance?: boolean;
    ielts?: boolean;
    max_users?: number;
    max_students?: number;
    max_groups?: number;
    max_storage_gb?: number;
    custom_branding?: boolean;
    priority_support?: boolean;
    api_access?: boolean;
    advanced_reporting?: boolean;
    [key: string]: any;
  };
}

export class UpdateSubscriptionPlanDto {
  @ApiPropertyOptional({ example: 'Pro Plan', description: 'Plan name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 49.99,
    description: 'Monthly price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_month?: number;

  @ApiPropertyOptional({
    example: 499.99,
    description: 'Yearly price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_year?: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency (UZS/USD)',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'Professional plan with all features',
    description: 'Plan description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: {
      leads: true,
      groups: true,
      payments: true,
    },
    description: 'Plan features configuration',
  })
  @IsOptional()
  @IsObject()
  features?: {
    leads?: boolean;
    groups?: boolean;
    payments?: boolean;
    salary?: boolean;
    attendance?: boolean;
    ielts?: boolean;
    max_users?: number;
    max_students?: number;
    max_groups?: number;
    max_storage_gb?: number;
    custom_branding?: boolean;
    priority_support?: boolean;
    api_access?: boolean;
    advanced_reporting?: boolean;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    example: true,
    description: 'Whether plan is active',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Subscription DTOs
export class CreateSubscriptionDto {
  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Subscription plan ID',
  })
  @IsNotEmpty()
  @IsString()
  plan_id: string;

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
  trial_ends_at?: string;

  @ApiPropertyOptional({
    example: '2025-12-13',
    description: 'Subscription renewal date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  renews_at?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Cancel subscription at period end',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  cancel_at_period_end?: boolean;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    example: 'uuid-string',
    description: 'Subscription plan ID',
  })
  @IsOptional()
  @IsString()
  plan_id?: string;

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
    example: '2025-11-27',
    description: 'Trial end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  trial_ends_at?: string;

  @ApiPropertyOptional({
    example: '2025-12-13',
    description: 'Subscription renewal date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  renews_at?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Cancel subscription at period end',
  })
  @IsOptional()
  @IsBoolean()
  cancel_at_period_end?: boolean;
}

// Invoice DTOs
export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Subscription ID',
  })
  @IsNotEmpty()
  @IsString()
  subscription_id: string;

  @ApiProperty({
    example: 49.99,
    description: 'Invoice amount',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    example: InvoiceStatus.PENDING,
    description: 'Invoice status',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    example: PaymentProvider.CLICK,
    description: 'Payment provider',
    enum: PaymentProvider,
    default: PaymentProvider.CLICK,
  })
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional({
    example: 'TXN123456789',
    description: 'Transaction ID from payment provider',
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    example: InvoiceStatus.PAID,
    description: 'Invoice status',
    enum: InvoiceStatus,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    example: 'TXN123456789',
    description: 'Transaction ID from payment provider',
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({
    example: '2025-11-13T10:30:00Z',
    description: 'Payment timestamp',
  })
  @IsOptional()
  @IsDateString()
  paid_at?: string;
}
