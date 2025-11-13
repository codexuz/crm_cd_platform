import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../entities/attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'uuid-string', description: 'Student user ID' })
  @IsNotEmpty()
  @IsString()
  student_id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Teacher user ID' })
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Group ID' })
  @IsNotEmpty()
  @IsString()
  group_id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiProperty({
    example: AttendanceStatus.PRESENT,
    description: 'Attendance status',
    enum: AttendanceStatus,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({
    example: '2025-11-13',
    description: 'Date when attendance was taken (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  taken_date: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    example: AttendanceStatus.PRESENT,
    description: 'Attendance status',
    enum: AttendanceStatus,
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({
    example: '2025-11-13',
    description: 'Date when attendance was taken (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  taken_date?: string;
}

export class BulkCreateAttendanceDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    description: 'Array of student user IDs',
  })
  @IsNotEmpty()
  @IsString({ each: true })
  student_ids: string[];

  @ApiProperty({ example: 'uuid-string', description: 'Teacher user ID' })
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Group ID' })
  @IsNotEmpty()
  @IsString()
  group_id: string;

  @ApiProperty({ example: 'uuid-string', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiProperty({
    example: AttendanceStatus.PRESENT,
    description: 'Default attendance status for all students',
    enum: AttendanceStatus,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({
    example: '2025-11-13',
    description: 'Date when attendance was taken (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  taken_date: string;
}
