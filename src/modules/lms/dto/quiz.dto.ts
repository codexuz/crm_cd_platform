import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizQuestionType } from '../../../entities';

export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({ description: 'Question explanation' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ enum: QuizQuestionType, description: 'Question type' })
  @IsEnum(QuizQuestionType)
  type: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Options for multiple choice questions',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({ description: 'Correct answer (varies by question type)' })
  @IsNotEmpty()
  correct_answer: any;

  @ApiPropertyOptional({ description: 'Points for this question', default: 1 })
  @IsInt()
  @IsOptional()
  points?: number;

  @ApiProperty({ description: 'Question order' })
  @IsInt()
  order: number;
}

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({ description: 'Question text' })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ description: 'Question explanation' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ enum: QuizQuestionType, description: 'Question type' })
  @IsEnum(QuizQuestionType)
  @IsOptional()
  type?: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Options for multiple choice questions',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({ description: 'Correct answer' })
  @IsOptional()
  correct_answer?: any;

  @ApiPropertyOptional({ description: 'Points for this question' })
  @IsInt()
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: 'Question order' })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateQuizDto {
  @ApiPropertyOptional({ description: 'Quiz title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Quiz description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Time limit in seconds' })
  @IsInt()
  @IsOptional()
  time_limit?: number;

  @ApiProperty({ description: 'Quiz questions', type: [CreateQuizQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}

export class UpdateQuizDto {
  @ApiPropertyOptional({ description: 'Quiz title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Quiz description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Time limit in seconds' })
  @IsInt()
  @IsOptional()
  time_limit?: number;
}

export class QuizResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lesson_id: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  time_limit?: number;

  @ApiProperty()
  created_at: Date;
}

export class QuizQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quiz_id: string;

  @ApiProperty()
  question: string;

  @ApiProperty({ required: false })
  explanation?: string;

  @ApiProperty({ enum: QuizQuestionType })
  type: QuizQuestionType;

  @ApiProperty({ required: false })
  options?: any;

  @ApiProperty()
  points: number;

  @ApiProperty()
  order: number;
}

export class SubmitQuizAnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty({ description: 'User answer' })
  @IsNotEmpty()
  answer: any;
}

export class SubmitQuizDto {
  @ApiProperty({ description: 'Quiz answers', type: [SubmitQuizAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAnswerDto)
  answers: SubmitQuizAnswerDto[];
}
