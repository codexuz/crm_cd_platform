import { IsNotEmpty, IsOptional, IsEnum, IsEmail, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterestLevel, LeadStatus } from '../../../entities';

export class CreateLeadDto {
  @ApiProperty({ example: 'John Smith', description: 'Lead full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+1234567890', description: 'Lead phone number' })
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Lead email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ 
    example: InterestLevel.HIGH, 
    description: 'Interest level',
    enum: InterestLevel
  })
  @IsEnum(InterestLevel)
  interest_level: InterestLevel;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Center ID' })
  @IsNotEmpty()
  @IsString()
  center_id: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6g7-8901-bcde-f12345678901', description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assigned_to?: string;

  @ApiPropertyOptional({ example: 'Interested in IELTS preparation', description: 'Notes about the lead' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '2024-12-15', description: 'Follow up date' })
  @IsOptional()
  @IsDateString()
  follow_up_date?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ example: 'John Smith', description: 'Lead full name' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Lead phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Lead email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ 
    example: InterestLevel.HIGH, 
    description: 'Interest level',
    enum: InterestLevel
  })
  @IsOptional()
  @IsEnum(InterestLevel)
  interest_level?: InterestLevel;

  @ApiPropertyOptional({ 
    example: LeadStatus.CONTACTED, 
    description: 'Lead status',
    enum: LeadStatus
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6g7-8901-bcde-f12345678901', description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assigned_to?: string;

  @ApiPropertyOptional({ example: 'Updated notes', description: 'Notes about the lead' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '2024-12-20', description: 'Follow up date' })
  @IsOptional()
  @IsDateString()
  follow_up_date?: string;
}