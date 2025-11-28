import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ description: 'Module title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Display order' })
  @IsInt()
  order: number;

  @ApiProperty({ description: 'Center ID' })
  @IsUUID()
  @IsNotEmpty()
  center_id: string;
}

export class UpdateModuleDto {
  @ApiPropertyOptional({ description: 'Module title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class ModuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  course_id: string;

  @ApiProperty()
  center_id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  order: number;
}
