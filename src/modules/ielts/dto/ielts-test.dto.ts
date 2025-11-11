import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionContentType } from '../../../entities';

export class CreateIeltsTestDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @IsOptional()
  @IsNumber()
  listening_id?: number;

  @IsOptional()
  @IsNumber()
  reading_id?: number;
}

export class UpdateIeltsTestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @IsOptional()
  @IsNumber()
  listening_id?: number;

  @IsOptional()
  @IsNumber()
  reading_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Define base classes first (used by Type() decorators)
export class QuestionContentDto {
  @IsString()
  id: string;

  @IsEnum(QuestionContentType)
  type: QuestionContentType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  questions?: any[];

  @IsOptional()
  @IsArray()
  options?: any[];

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsBoolean()
  showOptions?: boolean;

  @IsOptional()
  @IsString()
  optionsTitle?: string;
}

export class CreateQuestionDto {
  @IsArray()
  content: QuestionContentDto[];

  @IsNumber()
  number_of_questions: number;
}

export class CreateAudioDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  file_name?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  file_size?: number;
}

// Now define classes that use the above classes
export class CreateListeningPartDto {
  @IsEnum(['PART_1', 'PART_2', 'PART_3', 'PART_4'])
  part: string;

  @ValidateNested()
  @Type(() => CreateQuestionDto)
  question: CreateQuestionDto;

  @ValidateNested()
  @Type(() => CreateAudioDto)
  audio: CreateAudioDto;

  @IsOptional()
  answers?: Record<string, any>;
}

export class CreateListeningDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListeningPartDto)
  parts: CreateListeningPartDto[];
}

export class CreateReadingPartDto {
  @IsEnum(['PART_1', 'PART_2', 'PART_3'])
  part: string;

  @ValidateNested()
  @Type(() => CreateQuestionDto)
  question: CreateQuestionDto;

  @IsString()
  passage: string;

  @IsOptional()
  answers?: Record<string, any>;
}

export class CreateReadingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReadingPartDto)
  parts: CreateReadingPartDto[];
}
