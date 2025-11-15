import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  CompleteProfileDto,
  RegisterCenterDto,
} from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { SendOtpDto, VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email for verification' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendVerificationOtp(sendOtpDto.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{
    message: string;
    access_token: string;
    user: {
      id: string;
      name: string;
      email: string;
      center_id: string | null;
      roles: string[];
    };
  }> {
    return this.authService.verifyEmailOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP for email verification' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendVerificationOtp(resendOtpDto.email);
  }

  @Patch('complete-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Complete user profile information' })
  @ApiResponse({ status: 200, description: 'Profile completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeProfile(
    @GetUser('userId') userId: string,
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    return this.authService.completeProfile(userId, completeProfileDto);
  }

  @Post('register-center')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new center (for owners)' })
  @ApiResponse({ status: 201, description: 'Center registered successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Owner role required',
  })
  async registerCenter(
    @GetUser('userId') userId: string,
    @Body() registerCenterDto: RegisterCenterDto,
  ) {
    return this.authService.registerCenter(userId, registerCenterDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if account exists',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
