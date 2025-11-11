import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  IsDateString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestAssignmentStatus, TestResultStatus } from '../../../entities';

// Test Assignment DTOs
export class CreateTestAssignmentDto {
  @ApiProperty({
    description: 'ID of the IELTS test to assign',
    example: 1
  })
  @IsNumber()
  test_id: number;

  @ApiProperty({
    description: 'ID of the student to assign the test to',
    example: 5
  })
  @IsNumber()
  student_id: number;

  @ApiProperty({
    description: 'Due date for the test completion',
    example: '2025-12-01T23:59:59.000Z'
  })
  @IsDateString()
  due_date: string;

  @ApiPropertyOptional({
    description: 'Maximum number of attempts allowed',
    example: 3,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  max_attempts?: number;

  @ApiPropertyOptional({
    description: 'Time limit for the test in minutes',
    example: 180
  })
  @IsOptional()
  @IsNumber()
  time_limit_minutes?: number;

  @ApiPropertyOptional({
    description: 'Special instructions for the student',
    example: 'Please complete the test in a quiet environment with good internet connection.'
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class BulkAssignTestDto {
  @ApiProperty({
    description: 'ID of the IELTS test to assign',
    example: 1
  })
  @IsNumber()
  test_id: number;

  @ApiProperty({
    description: 'Array of student IDs to assign the test to',
    example: [5, 6, 7, 8]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids: number[];

  @ApiProperty({
    description: 'Due date for the test completion',
    example: '2025-12-01T23:59:59.000Z'
  })
  @IsDateString()
  due_date: string;

  @ApiPropertyOptional({
    description: 'Maximum number of attempts allowed',
    example: 3,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  max_attempts?: number;

  @ApiPropertyOptional({
    description: 'Time limit for the test in minutes',
    example: 180
  })
  @IsOptional()
  @IsNumber()
  time_limit_minutes?: number;

  @ApiPropertyOptional({
    description: 'Special instructions for the students',
    example: 'Please complete the test in a quiet environment with good internet connection.'
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateTestAssignmentDto {
  @ApiPropertyOptional({
    description: 'Status of the test assignment',
    enum: TestAssignmentStatus,
    example: TestAssignmentStatus.IN_PROGRESS
  })
  @IsOptional()
  @IsEnum(TestAssignmentStatus)
  status?: TestAssignmentStatus;

  @ApiPropertyOptional({
    description: 'Due date for the test completion',
    example: '2025-12-15T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of attempts allowed',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  max_attempts?: number;

  @ApiPropertyOptional({
    description: 'Time limit for the test in minutes',
    example: 150
  })
  @IsOptional()
  @IsNumber()
  time_limit_minutes?: number;

  @ApiPropertyOptional({
    description: 'Updated instructions for the student',
    example: 'Updated: Please use headphones for the listening section.'
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Whether the assignment is active',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Test Taking DTOs
export class StartTestDto {
  @ApiProperty({
    description: 'ID of the test assignment',
    example: 1
  })
  @IsNumber()
  assignment_id: number;
}

export class SubmitAnswersDto {
  @ApiProperty({
    description: 'ID of the test result session',
    example: 1
  })
  @IsNumber()
  result_id: number;

  @ApiPropertyOptional({
    description: 'Listening section answers',
    example: {
      "1": "A",
      "2": "library",
      "3": "B",
      "4": "15"
    }
  })
  @IsOptional()
  @IsObject()
  listening_answers?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Reading section answers',
    example: {
      "1": "TRUE",
      "2": "FALSE",
      "3": "NOT GIVEN",
      "4": "C"
    }
  })
  @IsOptional()
  @IsObject()
  reading_answers?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether to submit as final (complete the test)',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_final_submission?: boolean;
}

export class CompleteTestDto {
  @ApiProperty({
    description: 'ID of the test result session',
    example: 1
  })
  @IsNumber()
  result_id: number;

  @ApiProperty({
    description: 'Final listening section answers',
    example: {
      "1": "A",
      "2": "library",
      "3": "B",
      "4": "15"
    }
  })
  @IsObject()
  listening_answers: Record<string, any>;

  @ApiProperty({
    description: 'Final reading section answers',
    example: {
      "1": "TRUE",
      "2": "FALSE", 
      "3": "NOT GIVEN",
      "4": "C"
    }
  })
  @IsObject()
  reading_answers: Record<string, any>;
}

// Grading and Review DTOs
export class GradeTestDto {
  @ApiProperty({
    description: 'ID of the test result to grade',
    example: 1
  })
  @IsNumber()
  result_id: number;

  @ApiPropertyOptional({
    description: 'Listening section score',
    example: 7.5
  })
  @IsOptional()
  @IsNumber()
  listening_score?: number;

  @ApiPropertyOptional({
    description: 'Number of correct listening answers',
    example: 35
  })
  @IsOptional()
  @IsNumber()
  listening_correct_answers?: number;

  @ApiPropertyOptional({
    description: 'Reading section score',
    example: 8.0
  })
  @IsOptional()
  @IsNumber()
  reading_score?: number;

  @ApiPropertyOptional({
    description: 'Number of correct reading answers',
    example: 38
  })
  @IsOptional()
  @IsNumber()
  reading_correct_answers?: number;

  @ApiPropertyOptional({
    description: 'Overall band score',
    example: 7.5
  })
  @IsOptional()
  @IsNumber()
  band_score?: number;

  @ApiPropertyOptional({
    description: 'Detailed feedback for the student',
    example: {
      "listening": {
        "strengths": ["Good understanding of main ideas"],
        "improvements": ["Focus on specific details"]
      },
      "reading": {
        "strengths": ["Excellent vocabulary"],
        "improvements": ["Time management"]
      }
    }
  })
  @IsOptional()
  @IsObject()
  detailed_feedback?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Teacher comments',
    example: 'Good overall performance. Focus on listening for specific details in Part 1.'
  })
  @IsOptional()
  @IsString()
  teacher_comments?: string;
}

// Query DTOs
export class GetAssignmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by assignment status',
    enum: TestAssignmentStatus,
    example: TestAssignmentStatus.ASSIGNED
  })
  @IsOptional()
  @IsEnum(TestAssignmentStatus)
  status?: TestAssignmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 5
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  student_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by test ID',
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  test_id?: number;

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

export class GetResultsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by result status',
    enum: TestResultStatus,
    example: TestResultStatus.COMPLETED
  })
  @IsOptional()
  @IsEnum(TestResultStatus)
  status?: TestResultStatus;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 5
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  student_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by assignment ID',
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  assignment_id?: number;

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