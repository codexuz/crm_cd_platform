import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../../../entities';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-student-id', description: 'Student user ID' })
  @IsNotEmpty()
  @IsString()
  student_id: string;

  @ApiProperty({ example: 299.99, description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2024-12-01', description: 'Payment date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ 
    example: PaymentMethod.CARD, 
    description: 'Payment method',
    enum: PaymentMethod
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 'uuid-center-id', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiPropertyOptional({ example: 'Monthly tuition fee', description: 'Payment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'REF123456789', description: 'Reference number' })
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiPropertyOptional({ 
    example: PaymentStatus.COMPLETED, 
    description: 'Payment status',
    enum: PaymentStatus
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 299.99, description: 'Payment amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: '2024-12-01', description: 'Payment date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ 
    example: PaymentMethod.CARD, 
    description: 'Payment method',
    enum: PaymentMethod
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ 
    example: PaymentStatus.COMPLETED, 
    description: 'Payment status',
    enum: PaymentStatus
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Payment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'REF987654321', description: 'Reference number' })
  @IsOptional()
  @IsString()
  reference_number?: string;
}