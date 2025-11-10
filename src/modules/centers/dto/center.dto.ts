import { IsNotEmpty, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCenterDto {
  @ApiProperty({ example: 'IELTS Learning Center', description: 'Center name' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'ielts-center', description: 'Subdomain for multi-tenancy (auto-generated if not provided)' })
  @IsOptional()
  subdomain?: string;

  @ApiPropertyOptional({ example: '123 Main Street, City', description: 'Center address' })
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 1, description: 'Owner user ID' })
  @IsNotEmpty()
  owner_id: number;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Center phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@center.com', description: 'Center email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Premier IELTS training center', description: 'Center description' })
  @IsOptional()
  description?: string;
}

export class UpdateCenterDto {
  @ApiPropertyOptional({ example: 'IELTS Learning Center', description: 'Center name' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'new-subdomain', description: 'Subdomain for multi-tenancy' })
  @IsOptional()
  subdomain?: string;

  @ApiPropertyOptional({ example: '123 Main Street, City', description: 'Center address' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Center phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@center.com', description: 'Center email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Premier IELTS training center', description: 'Center description' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Center active status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}