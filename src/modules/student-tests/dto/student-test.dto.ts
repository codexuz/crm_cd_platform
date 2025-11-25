import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTestToStudentDto {
  @ApiProperty({
    description: 'UUID of the student to assign the test to',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  student_id: string;

  @ApiProperty({
    description: 'UUID of the IELTS test to assign',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  test_id: string;

  @ApiProperty({
    description: 'UUID of the teacher assigning the test',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsUUID()
  assigned_by: string;

  @ApiPropertyOptional({
    description: 'Scheduled start time for the test (ISO 8601 format)',
    example: '2025-11-20T13:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  test_start_time?: string;

  @ApiPropertyOptional({
    description: 'Scheduled end time for the test (ISO 8601 format)',
    example: '2025-11-20T15:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  test_end_time?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the test assignment',
    example: 'Student requested morning session',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAssignedTestDto {
  @ApiPropertyOptional({
    description: 'Updated start time for the test (ISO 8601 format)',
    example: '2025-11-20T14:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  test_start_time?: string;

  @ApiPropertyOptional({
    description: 'Updated end time for the test (ISO 8601 format)',
    example: '2025-11-20T16:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  test_end_time?: string;

  @ApiPropertyOptional({
    description: 'Updated status of the test assignment',
    enum: ['pending', 'in_progress', 'completed', 'expired'],
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'expired'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Updated notes for the test assignment',
    example: 'Extended time granted',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StudentLoginDto {
  @ApiProperty({
    description: '10-digit candidate ID for student authentication',
    example: '1234567890',
    minLength: 10,
    maxLength: 10,
  })
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]{10}$/, { message: 'Candidate ID must be exactly 10 digits' })
  candidate_id: string;
}

export class SubmitTestResultDto {
  @ApiPropertyOptional({
    description: 'Complete test results for all sections',
    example: {
      listening: {
        answers: ['A', 'B', 'C', 'A', 'B'],
      },
      reading: {
        answers: [14, 'TRUE', 'NOT GIVEN', 'FALSE', 27],
      },
      writing: {
        answers: [
          { task_1_answer: 'The graph shows...', word_count: 290 },
          { task_2_answer: 'In conclusion...', word_count: 290 },
        ],
      },
      submitted_at: '2025-11-20T10:30:00.000Z',
      total_time_spent: 180,
    },
  })
  @IsOptional()
  test_results?: TestResults;
}

export interface TestResults {
  listening?: ListeningResults;
  reading?: ReadingResults;
  writing?: WritingResults;
  submitted_at?: string;
  total_time_spent?: number; // in minutes
}

export interface ListeningResults {
  answers: (string | number)[]; // Array of answers in order
}

export interface ReadingResults {
  answers: (string | number)[]; // Array of answers in order
}

export interface WritingResults {
  answers: {
    task_1_answer?: string;
    task_2_answer?: string;
    word_count: number;
  }[];
}

export class SaveSectionProgressDto {
  @ApiProperty({
    description: 'Test section to save progress for',
    enum: ['listening', 'reading', 'writing'],
    example: 'listening',
  })
  @IsEnum(['listening', 'reading', 'writing'])
  section: 'listening' | 'reading' | 'writing';

  @ApiPropertyOptional({
    description:
      'Array of answers for batch saving (for listening/reading) or task answers (for writing)',
    example: ['A', 'B', 'C', 'A', 'B'],
  })
  @IsOptional()
  answers?:
    | (string | number)[]
    | {
        task_1_answer?: string;
        task_2_answer?: string;
        word_count: number;
      }[];

  @ApiPropertyOptional({
    description: 'Time spent on this section so far in minutes',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  time_spent?: number;

  @ApiPropertyOptional({
    description: 'Current question being worked on',
    example: 'listening_1_4',
  })
  @IsOptional()
  current_question?: string;
}

export interface TestContentResponse {
  test: any; // IELTS test object
  candidate_id: string;
  student: any; // Student object
  test_start_time: string | null;
  test_end_time: string | null;
  status: string;
}

// Final checked results interfaces
export interface ListeningFinalResult {
  correct: number;
  incorrect: number;
  score: number; // Band score (0-9)
  totalQuestions: number;
}

export interface ReadingFinalResult {
  correct: number;
  incorrect: number;
  score: number; // Band score (0-9)
  totalQuestions: number;
}

export interface WritingFinalResult {
  task1Score?: number;
  task2Score?: number;
  averageScore?: number;
  feedback?: string;
}
