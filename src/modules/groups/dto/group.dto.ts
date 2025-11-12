import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupLevel } from '../../../entities';

export class CreateGroupDto {
  @ApiProperty({ example: 'Advanced IELTS Group A', description: 'Group name' })
  @IsNotEmpty()
  @IsString()
  group_name: string;

  @ApiProperty({ 
    example: GroupLevel.INTERMEDIATE, 
    description: 'Group level',
    enum: GroupLevel
  })
  @IsEnum(GroupLevel)
  level: GroupLevel;

  @ApiProperty({ example: 'uuid-string', description: 'Teacher user ID' })
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiPropertyOptional({ example: 'Intensive IELTS preparation course', description: 'Group description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '09:00', description: 'Class time (HH:MM format)' })
  @IsOptional()
  @IsString()
  class_time?: string;

  @ApiPropertyOptional({ example: 15, description: 'Maximum number of students' })
  @IsOptional()
  @IsNumber()
  max_students?: number;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2', 'uuid-3'], description: 'Array of student user IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  student_ids?: string[];
}

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: 'Advanced IELTS Group A', description: 'Group name' })
  @IsOptional()
  @IsString()
  group_name?: string;

  @ApiPropertyOptional({ 
    example: GroupLevel.INTERMEDIATE, 
    description: 'Group level',
    enum: GroupLevel
  })
  @IsOptional()
  @IsEnum(GroupLevel)
  level?: GroupLevel;

  @ApiPropertyOptional({ example: 'uuid-string', description: 'Teacher user ID' })
  @IsOptional()
  @IsString()
  teacher_id?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Group description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '10:00', description: 'Class time (HH:MM format)' })
  @IsOptional()
  @IsString()
  class_time?: string;

  @ApiPropertyOptional({ example: 20, description: 'Maximum number of students' })
  @IsOptional()
  @IsNumber()
  max_students?: number;

  @ApiPropertyOptional({ example: true, description: 'Group active status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class AddStudentToGroupDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2', 'uuid-3'], description: 'Array of student user IDs to add' })
  @IsArray()
  @IsString({ each: true })
  student_ids: string[];
}

export class RemoveStudentFromGroupDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Array of student user IDs to remove' })
  @IsArray()
  @IsString({ each: true })
  student_ids: string[];
}