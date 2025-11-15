import { IsString, IsEmail, IsOptional } from 'class-validator';

export class SendEmailDto {
  @IsString({ each: true })
  to: string | string[];

  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsEmail()
  @IsOptional()
  from?: string;
}
