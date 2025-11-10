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

  @ApiProperty({ example: 1, description: 'Teacher user ID' })
  @IsNotEmpty()
  @IsNumber()
  teacher_id: number;

  @ApiProperty({ example: 1, description: 'Center ID' })
  @IsNotEmpty()
  @IsNumber()
  center_id: number;

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

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Array of student user IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids?: number[];
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

  @ApiPropertyOptional({ example: 1, description: 'Teacher user ID' })
  @IsOptional()
  @IsNumber()
  teacher_id?: number;

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
  @ApiProperty({ example: [1, 2, 3], description: 'Array of student user IDs to add' })
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids: number[];
}

export class RemoveStudentFromGroupDto {
  @ApiProperty({ example: [1, 2], description: 'Array of student user IDs to remove' })
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids: number[];
}