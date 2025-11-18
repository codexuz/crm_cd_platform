import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '../../../entities/media.entity';

export class UploadMediaDto {
  @ApiPropertyOptional({
    description: 'Alternative text for the media',
    example: 'Profile picture of John Doe',
  })
  @IsOptional()
  @IsString()
  alt_text?: string;

  @ApiPropertyOptional({
    description: 'Description of the media',
    example: 'Company logo in PNG format',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Center ID to associate media with',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  center_id?: string;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({
    description: 'Original filename',
    example: 'document.pdf',
  })
  @IsOptional()
  @IsString()
  original_filename?: string;

  @ApiPropertyOptional({
    description: 'Alternative text for the media',
    example: 'Updated profile picture',
  })
  @IsOptional()
  @IsString()
  alt_text?: string;

  @ApiPropertyOptional({
    description: 'Description of the media',
    example: 'Updated company logo',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Width in pixels',
    example: 1920,
  })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({
    description: 'Height in pixels',
    example: 1080,
  })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({
    description: 'Duration in seconds',
    example: 180,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class MediaFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by media type',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @ApiPropertyOptional({
    description: 'Filter by center ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  center_id?: string;

  @ApiPropertyOptional({
    description: 'Search by filename',
    example: 'logo',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
