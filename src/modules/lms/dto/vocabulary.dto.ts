import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateVocabularyDto {
  @ApiProperty({ description: 'English word' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ description: 'Uzbek translation' })
  @IsString()
  @IsNotEmpty()
  uz: string;

  @ApiProperty({ description: 'Russian translation' })
  @IsString()
  @IsNotEmpty()
  ru: string;

  @ApiPropertyOptional({ description: 'Example sentence' })
  @IsString()
  @IsOptional()
  example?: string;

  @ApiPropertyOptional({ description: 'Audio pronunciation URL' })
  @IsString()
  @IsOptional()
  audio_url?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ description: 'Display order' })
  @IsInt()
  order: number;
}

export class UpdateVocabularyDto {
  @ApiPropertyOptional({ description: 'English word' })
  @IsString()
  @IsOptional()
  word?: string;

  @ApiPropertyOptional({ description: 'Uzbek translation' })
  @IsString()
  @IsOptional()
  uz?: string;

  @ApiPropertyOptional({ description: 'Russian translation' })
  @IsString()
  @IsOptional()
  ru?: string;

  @ApiPropertyOptional({ description: 'Example sentence' })
  @IsString()
  @IsOptional()
  example?: string;

  @ApiPropertyOptional({ description: 'Audio pronunciation URL' })
  @IsString()
  @IsOptional()
  audio_url?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class VocabularyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lesson_id: string;

  @ApiProperty()
  word: string;

  @ApiProperty()
  uz: string;

  @ApiProperty()
  ru: string;

  @ApiProperty({ required: false })
  example?: string;

  @ApiProperty({ required: false })
  audio_url?: string;

  @ApiProperty({ required: false })
  image_url?: string;

  @ApiProperty()
  order: number;
}
