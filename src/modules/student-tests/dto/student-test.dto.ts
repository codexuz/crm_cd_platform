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
        answers: ['A', 'B', 'C', 'A', 'B'],
        score: 6.5,
        correct: 27,
        incorrect: 13,
      },
      reading: {
        answers: [14, 'TRUE', 'NOT GIVEN', 'FALSE', 27],
        score: 6.5,
        correct: 27,
        incorrect: 13,
      },
      writing: {
        answers: [
          { task_1_answer: 'The graph shows...', word_count: 290, score: 6.5 },
          { task_2_answer: 'In conclusion...', word_count: 290, score: 6.0 },
        ],
        feedback: 'Good structure but needs more vocabulary variety',
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
  score: number; // Band score (0-9)
  correct: number; // Number of correct answers
  incorrect: number; // Number of incorrect answers
}

export interface ReadingResults {
  answers: (string | number)[]; // Array of answers in order
  score: number; // Band score (0-9)
  correct: number; // Number of correct answers
  incorrect: number; // Number of incorrect answers
}

export interface WritingResults {
  answers: {
    task_1_answer?: string;
    task_2_answer?: string;
    word_count: number;
    score: number; // Band score for the task
  }[];
  feedback: string; // Teacher feedback
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
    description: 'Band score for this writing task',
    example: 6.5,
  })
  @IsOptional()
  @IsNumber()
  score?: number;
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
        score: number;
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
