import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  CompleteProfileDto,
  RegisterCenterDto,
} from './dto/auth.dto';
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



  @Get('google/owner')
  @UseGuards(AuthGuard('google-owner'))
  @ApiOperation({
    summary: 'Initiate Google OAuth authentication for center owners',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  googleAuthOwner() {
    // Role will be handled in the callback
  }

 


  @Get('google/owner/callback')
  @UseGuards(AuthGuard('google-owner'))
  @ApiOperation({ summary: 'Google OAuth callback for center owners' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with auth token',
  })
  googleOwnerAuthRedirect(@Req() req: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { access_token, user } = req.user;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userWithRole = { ...user, roleType: 'owner' };

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(userWithRole))}&type=owner`;

    res.redirect(redirectUrl);
  }


  
  @Patch('complete-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Complete user profile after Google OAuth' })
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
}
