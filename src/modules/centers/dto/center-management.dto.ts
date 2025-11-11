import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  IsEmail,
  IsPhoneNumber,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Student Management DTOs
export class CreateStudentDto {
  @ApiProperty({
    description: 'Full name of the student',
    example: 'John Smith'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.smith@email.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890'
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Password for the student account',
    example: 'securePassword123',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the student',
    example: 'Intermediate level, preparing for university admission'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Target IELTS band score',
    example: 7.5
  })
  @IsOptional()
  @IsNumber()
  target_band_score?: number;

  @ApiPropertyOptional({
    description: 'Student level (Beginner, Intermediate, Advanced)',
    example: 'Intermediate'
  })
  @IsOptional()
  @IsString()
  level?: string;
}

export class UpdateStudentDto {
  @ApiPropertyOptional({
    description: 'Full name of the student',
    example: 'John Smith Jr.'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.smith.jr@email.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567891'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Whether the student account is active',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes about the student',
    example: 'Updated: Advanced level, preparing for IELTS Academic'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Target IELTS band score',
    example: 8.0
  })
  @IsOptional()
  @IsNumber()
  target_band_score?: number;

  @ApiPropertyOptional({
    description: 'Student level',
    example: 'Advanced'
  })
  @IsOptional()
  @IsString()
  level?: string;
}

export class BulkCreateStudentsDto {
  @ApiProperty({
    description: 'Array of students to create',
    type: [CreateStudentDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];

  @ApiPropertyOptional({
    description: 'Default password for all students (if not specified individually)',
    example: 'defaultPassword123'
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  default_password?: string;

  @ApiPropertyOptional({
    description: 'Send welcome emails to students',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  send_welcome_emails?: boolean;
}

// Teacher Assignment DTO
export class AssignTeacherDto {
  @ApiProperty({
    description: 'Array of student IDs to assign to the teacher',
    example: [1, 2, 3, 4, 5]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids: number[];
}

// Query DTOs
export class GetStudentsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by student level',
    example: 'Intermediate'
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by teacher ID',
    example: 5
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  teacher_id?: number;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number;
}

export class CenterAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for analytics (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date for analytics (YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Filter by student level',
    example: 'Intermediate'
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    description: 'Filter by teacher ID',
    example: 5
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  teacher_id?: number;

  @ApiPropertyOptional({
    description: 'Group results by (day, week, month)',
    example: 'month',
    default: 'month'
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  group_by?: 'day' | 'week' | 'month';
}