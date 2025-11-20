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

export class AssignTestToStudentDto {
  @IsUUID()
  student_id: string;

  @IsUUID()
  test_id: string;

  @IsOptional()
  @IsDateString()
  test_start_time?: string;

  @IsOptional()
  @IsDateString()
  test_end_time?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAssignedTestDto {
  @IsOptional()
  @IsDateString()
  test_start_time?: string;

  @IsOptional()
  @IsDateString()
  test_end_time?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'expired'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StudentLoginDto {
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]{10}$/, { message: 'Candidate ID must be exactly 10 digits' })
  candidate_id: string;
}

export class SubmitTestResultDto {
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
  @IsString()
  question_id: string;

  @IsString()
  answer: string | number;
}

export class SaveReadingAnswerDto {
  @IsString()
  question_id: string;

  @IsString()
  answer: string | number;
}

export class SaveWritingTaskDto {
  @IsEnum(['task1', 'task2'])
  task: 'task1' | 'task2';

  @IsString()
  answer: string;

  @IsOptional()
  @IsNumber()
  word_count?: number;

  @IsOptional()
  @IsNumber()
  time_spent?: number;
}

export class SaveSectionProgressDto {
  @IsEnum(['listening', 'reading', 'writing'])
  section: 'listening' | 'reading' | 'writing';

  @IsOptional()
  answers?: Record<string, string | number>;

  @IsOptional()
  @IsNumber()
  time_spent?: number;

  @IsOptional()
  current_question?: string; // For tracking progress
}

export interface TestContentResponse {
  test: any; // IELTS test object
  candidate_id: string;
  student: any; // Student object
  test_start_time: string | null;
  test_end_time: string | null;
  status: string;
}
