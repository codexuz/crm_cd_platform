import {
  IsEnum,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '../../../entities';
import { PrivilegeName } from '../../../entities';

export class CreateRoleDto {
  @ApiProperty({ enum: RoleName, example: RoleName.CUSTOM })
  @IsEnum(RoleName)
  role_name: RoleName;

  @ApiProperty({ example: 'Custom Role Name' })
  @IsString()
  display_name: string;

  @ApiProperty({ example: 'Description of the role', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Center ID (null for super admin roles)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  center_id?: number;

  @ApiProperty({
    example: [PrivilegeName.USER_READ, PrivilegeName.USER_CREATE],
    type: [String],
  })
  @IsArray()
  @IsEnum(PrivilegeName, { each: true })
  privilege_names: PrivilegeName[];
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'Updated Role Name', required: false })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: [PrivilegeName.USER_READ, PrivilegeName.USER_UPDATE],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PrivilegeName, { each: true })
  privilege_names?: PrivilegeName[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class AssignRoleDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: [1, 2], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  role_ids: number[];
}
