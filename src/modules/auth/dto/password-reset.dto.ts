import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-string',
    description: 'Password reset token',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password (min 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
