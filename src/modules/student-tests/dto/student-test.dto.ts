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
        answers: { listening_1_1: 'A', listening_1_2: 'B' },
        time_spent: 40,
        scores: { section1: 8, section2: 7, total: 32 },
      },
      reading: {
        answers: { reading_1_1: 14, reading_1_2: 'TRUE' },
        time_spent: 60,
        scores: { section1: 7, section2: 8, total: 21 },
      },
      writing: {
        task1: {
          answer: 'The graph shows...',
          word_count: 180,
          time_spent: 35,
        },
        task2: {
          answer: 'In conclusion...',
          word_count: 320,
          time_spent: 45,
        },
        time_spent: 80,
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

export interface WritingResults {
  task1?: {
    answer: string;
    word_count?: number;
    time_spent?: number; // in minutes
  };
  task2?: {
    answer: string;
    word_count?: number;
    time_spent?: number; // in minutes
  };
}

// Base interface for section results
export interface BaseSectionResults {
  answers?: Record<string, string | number>;
  time_spent?: number;
  current_question?: string;
}

export interface ListeningResults extends BaseSectionResults {
  answers: Record<string, string | number>; // question_id -> answer
  scores?: {
    section1?: number;
    section2?: number;
    section3?: number;
    section4?: number;
    total?: number;
  };
  time_spent?: number; // in minutes
}

export interface ReadingResults extends BaseSectionResults {
  answers: Record<string, string | number>; // question_id -> answer
  scores?: {
    section1?: number;
    section2?: number;
    section3?: number;
    total?: number;
  };
  time_spent?: number; // in minutes
}

export interface WritingResults {
  task1?: {
    answer: string;
    word_count?: number;
    time_spent?: number; // in minutes
  };
  task2?: {
    answer: string;
    word_count?: number;
    time_spent?: number; // in minutes
  };
  time_spent?: number; // total writing time
  current_question?: string; // current task being worked on
}

// Individual save DTOs for incremental saving
export class SaveListeningAnswerDto {
  @ApiProperty({
    description: 'Unique identifier for the listening question',
    example: 'listening_1_1',
  })
  @IsString()
  question_id: string;

  @ApiProperty({
    description: 'Answer to the listening question (string or number)',
    example: 'A',
  })
  @IsString()
  answer: string | number;
}

export class SaveReadingAnswerDto {
  @ApiProperty({
    description: 'Unique identifier for the reading question',
    example: 'reading_2_3',
  })
  @IsString()
  question_id: string;

  @ApiProperty({
    description: 'Answer to the reading question (string or number)',
    example: 27,
  })
  @IsString()
  answer: string | number;
}

export class SaveWritingTaskDto {
  @ApiProperty({
    description: 'Writing task identifier',
    enum: ['task1', 'task2'],
    example: 'task1',
  })
  @IsEnum(['task1', 'task2'])
  task: 'task1' | 'task2';

  @ApiProperty({
    description: 'Written response for the task',
    example:
      'The chart illustrates the consumption of three different types of fast food in the UK over a 20-year period. Overall, pizza and hamburgers increased while fish and chips declined.',
  })
  @IsString()
  answer: string;

  @ApiPropertyOptional({
    description: 'Word count of the written response',
    example: 45,
  })
  @IsOptional()
  @IsNumber()
  word_count?: number;

  @ApiPropertyOptional({
    description: 'Time spent on this task in minutes',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  time_spent?: number;
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
    description: 'Map of question IDs to answers for batch saving',
    example: { listening_1_1: 'B', listening_1_2: 'C', listening_1_3: 'A' },
  })
  @IsOptional()
  answers?: Record<string, string | number>;

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
