import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsUUID,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Lesson content (JSON format)' })
  @IsObject()
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsString()
  @IsOptional()
  video_url?: string;

  @ApiProperty({ description: 'Display order' })
  @IsInt()
  order: number;

  @ApiProperty({ description: 'Center ID' })
  @IsUUID()
  @IsNotEmpty()
  center_id: string;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Lesson title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Lesson content (JSON format)' })
  @IsObject()
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsString()
  @IsOptional()
  video_url?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class LessonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  module_id: string;

  @ApiProperty()
  center_id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  content?: any;

  @ApiProperty({ required: false })
  video_url?: string;

  @ApiProperty()
  order: number;
}
