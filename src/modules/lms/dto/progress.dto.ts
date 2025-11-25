import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class LessonProgressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  lesson_id: string;

  @ApiProperty()
  is_completed: boolean;

  @ApiProperty({ required: false })
  completed_at?: Date;
}

export class CourseProgressResponseDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  course_id: string;

  @ApiProperty({ description: 'Completion percentage' })
  percentage: number;

  @ApiProperty()
  updated_at: Date;
}

export class QuizAttemptResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  quiz_id: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  is_passed: boolean;

  @ApiProperty()
  attempt_number: number;

  @ApiProperty()
  submitted_at: Date;
}

export class MarkLessonCompleteDto {
  @ApiPropertyOptional({ description: 'Mark as completed', default: true })
  @IsBoolean()
  @IsOptional()
  is_completed?: boolean;
}
