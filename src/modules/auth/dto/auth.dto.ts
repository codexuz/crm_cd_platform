import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
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

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
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

  @ApiProperty({ example: 1, description: 'Center ID' })
  @IsNotEmpty()
  center_id: number;
}