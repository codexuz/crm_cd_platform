import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalaryStatus } from '../../../entities';

export class CreateTeacherSalaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Teacher user ID' })
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @ApiProperty({ example: '2024-12', description: 'Salary month (YYYY-MM format)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' })
  month: string;

  @ApiProperty({ example: 2500.00, description: 'Total salary amount' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 40, description: 'Total hours taught' })
  @IsOptional()
  @IsNumber()
  hours_taught?: number;

  @ApiPropertyOptional({ example: 25.00, description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  hourly_rate?: number;

  @ApiPropertyOptional({ example: 200.00, description: 'Bonus amount' })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional({ example: 50.00, description: 'Deductions amount' })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiPropertyOptional({ example: 'Performance bonus included', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    example: SalaryStatus.PENDING, 
    description: 'Salary status',
    enum: SalaryStatus
  })
  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;
}

export class UpdateTeacherSalaryDto {
  @ApiPropertyOptional({ example: 2600.00, description: 'Total salary amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ 
    example: SalaryStatus.PAID, 
    description: 'Salary status',
    enum: SalaryStatus
  })
  @IsOptional()
  @IsEnum(SalaryStatus)
  status?: SalaryStatus;

  @ApiPropertyOptional({ example: 42, description: 'Total hours taught' })
  @IsOptional()
  @IsNumber()
  hours_taught?: number;

  @ApiPropertyOptional({ example: 25.50, description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  hourly_rate?: number;

  @ApiPropertyOptional({ example: 150.00, description: 'Bonus amount' })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional({ example: 30.00, description: 'Deductions amount' })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiPropertyOptional({ example: 'Updated salary calculation', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2024-12-01', description: 'Date when salary was paid (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  paid_date?: string;
}

export class MarkSalaryPaidDto {
  @ApiProperty({ example: '2024-12-01', description: 'Date when salary was paid (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsString()
  paid_date: string;

  @ApiPropertyOptional({ example: 'Paid via bank transfer', description: 'Payment notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}