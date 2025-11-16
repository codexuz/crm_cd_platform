import { IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsArray, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '../../../entities';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'uuid-string', description: 'Center ID (optional for initial user creation)' })
  @IsOptional()
  center_id?: string;

  @ApiPropertyOptional({ 
    example: [RoleName.STUDENT], 
    description: 'User roles',
    enum: RoleName,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  roles?: RoleName[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'User phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'uuid-string', description: 'Center ID' })
  @IsOptional()
  center_id?: string;

  @ApiPropertyOptional({ example: true, description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ 
    example: [RoleName.STUDENT], 
    description: 'User roles',
    enum: RoleName,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  roles?: RoleName[];
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', description: 'New password' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}