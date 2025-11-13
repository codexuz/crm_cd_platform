import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleName } from '../../../entities/center-settings.entity';

export class CreateCenterSettingsDto {
  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  center_id: string;

  @ApiProperty({
    example: ModuleName.LEADS,
    description: 'Module name',
    enum: ModuleName,
  })
  @IsEnum(ModuleName)
  module_name: ModuleName;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the module is enabled',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;

  @ApiPropertyOptional({
    example: { max_leads: 100, auto_assign: true },
    description: 'Module-specific configuration',
  })
  @IsOptional()
  @IsObject()
  module_config?: Record<string, any>;
}

export class UpdateCenterSettingsDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Whether the module is enabled',
  })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;

  @ApiPropertyOptional({
    example: { max_leads: 100, auto_assign: true },
    description: 'Module-specific configuration',
  })
  @IsOptional()
  @IsObject()
  module_config?: Record<string, any>;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({
    example: [
      { module_name: 'leads', is_enabled: true },
      { module_name: 'payments', is_enabled: false },
    ],
    description: 'Array of module settings to update',
  })
  @IsNotEmpty()
  settings: Array<{
    module_name: ModuleName;
    is_enabled: boolean;
    module_config?: Record<string, any>;
  }>;
}

export class InitializeCenterSettingsDto {
  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  center_id: string;

  @ApiPropertyOptional({
    example: {
      leads: true,
      payments: true,
      salary: true,
      groups: true,
      attendance: true,
      ielts: false,
    },
    description: 'Initial module enable/disable settings',
  })
  @IsOptional()
  @IsObject()
  modules?: Record<string, boolean>;
}
