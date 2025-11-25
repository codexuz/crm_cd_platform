import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsObject,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizQuestionType, QuizType } from '../../../entities';

export class CreateQuizQuestionDto {
  @ApiPropertyOptional({
    description: 'Vocabulary ID (for vocabulary questions)',
  })
  @IsUUID()
  @IsOptional()
  vocabulary_id?: string;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ enum: QuizQuestionType, description: 'Question type' })
  @IsEnum(QuizQuestionType)
  type: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Options for MCQ (array of strings)',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({ description: 'Correct answer (string, boolean, or array)' })
  @IsNotEmpty()
  correct_answer: any;

  @ApiProperty({ description: 'Question order' })
  @IsInt()
  order: number;
}

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({
    description: 'Vocabulary ID (for vocabulary questions)',
  })
  @IsUUID()
  @IsOptional()
  vocabulary_id?: string;

  @ApiPropertyOptional({ description: 'Question text' })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ enum: QuizQuestionType, description: 'Question type' })
  @IsEnum(QuizQuestionType)
  @IsOptional()
  type?: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Options for MCQ (array of strings)',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({ description: 'Correct answer' })
  @IsOptional()
  correct_answer?: any;

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

  @ApiPropertyOptional({
    enum: QuizType,
    description: 'Quiz type',
    default: QuizType.GENERAL,
  })
  @IsEnum(QuizType)
  @IsOptional()
  quiz_type?: QuizType;

  @ApiPropertyOptional({
    description: 'Is this a vocabulary-based quiz?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  vocabulary_based?: boolean;

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

  @ApiPropertyOptional({ enum: QuizType, description: 'Quiz type' })
  @IsEnum(QuizType)
  @IsOptional()
  quiz_type?: QuizType;

  @ApiPropertyOptional({ description: 'Is this a vocabulary-based quiz?' })
  @IsBoolean()
  @IsOptional()
  vocabulary_based?: boolean;

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

  @ApiProperty({ enum: QuizType })
  quiz_type: QuizType;

  @ApiProperty()
  vocabulary_based: boolean;

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

  @ApiProperty({ required: false })
  vocabulary_id?: string;

  @ApiProperty()
  question: string;

  @ApiProperty({ enum: QuizQuestionType })
  type: QuizQuestionType;

  @ApiProperty({ required: false })
  options?: any;

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

export class GenerateVocabularyQuizDto {
  @ApiPropertyOptional({ description: 'Quiz title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Time limit in seconds' })
  @IsInt()
  @IsOptional()
  time_limit?: number;

  @ApiPropertyOptional({
    description: 'Question types to include',
    enum: QuizQuestionType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(QuizQuestionType, { each: true })
  @IsOptional()
  question_types?: QuizQuestionType[];

  @ApiPropertyOptional({
    description: 'Number of questions per vocabulary word',
    default: 1,
  })
  @IsInt()
  @IsOptional()
  questions_per_word?: number;
}
