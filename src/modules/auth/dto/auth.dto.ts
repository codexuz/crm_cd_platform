import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '../../../entities';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'student',
    description: 'User role (student, teacher, or owner)',
    enum: RoleName,
  })
  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  @ApiPropertyOptional({
    example: 'uuid-string',
    description: 'Center ID (optional for initial user creation)',
  })
  @IsOptional()
  center_id?: string;
}

export class GoogleAuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    name: string;
    email: string;
    center_id: string | null;
    avatar_url: string | null;
    provider: string;
    roles: string[];
  };
}

export class CompleteProfileDto {
  @ApiProperty({ example: '+1234567890', description: 'User phone number' })
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    example: 'uuid-string',
    description: 'Center ID to assign user to',
  })
  @IsOptional()
  center_id?: string;
}

export class RegisterCenterDto {
  @ApiProperty({ example: 'My Learning Center', description: 'Center name' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'my-center',
    description: 'Subdomain for the center',
  })
  @IsOptional()
  subdomain?: string;

  @ApiPropertyOptional({
    example: '123 Main St, City',
    description: 'Center address',
  })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Center phone number',
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'contact@center.com',
    description: 'Center email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'A premier learning center',
    description: 'Center description',
  })
  @IsOptional()
  description?: string;
}
