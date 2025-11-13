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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/student')
  @UseGuards(AuthGuard('google-student'))
  @ApiOperation({
    summary: 'Initiate Google OAuth authentication for students',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  googleAuthStudent() {
    // Role will be handled in the callback
  }

  @Get('google/teacher')
  @UseGuards(AuthGuard('google-teacher'))
  @ApiOperation({
    summary: 'Initiate Google OAuth authentication for teachers',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  googleAuthTeacher() {
    // Role will be handled in the callback
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

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with auth token',
  })
  googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { access_token, user } = req.user;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`;

    res.redirect(redirectUrl);
  }

  @Get('google/student/callback')
  @UseGuards(AuthGuard('google-student'))
  @ApiOperation({ summary: 'Google OAuth callback for students' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with auth token',
  })
  googleStudentAuthRedirect(@Req() req: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { access_token, user } = req.user;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userWithRole = { ...user, roleType: 'student' };

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(userWithRole))}&type=student`;

    res.redirect(redirectUrl);
  }

  @Get('google/teacher/callback')
  @UseGuards(AuthGuard('google-teacher'))
  @ApiOperation({ summary: 'Google OAuth callback for teachers' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with auth token',
  })
  googleTeacherAuthRedirect(@Req() req: any, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { access_token, user } = req.user;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userWithRole = { ...user, roleType: 'teacher' };

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(userWithRole))}&type=teacher`;

    res.redirect(redirectUrl);
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

  @Get('callback')
  @ApiOperation({ summary: 'Handle auth callback with token' })
  @ApiResponse({
    status: 200,
    description: 'Processes auth token and redirects to dashboard',
  })
  handleCallback(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({
        message: 'No token provided',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    // Verify the token and get user info
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.authService.verifyToken(token);

      const script = `
        <script>
          localStorage.setItem('authToken', '${token}');
          localStorage.setItem('user', '${JSON.stringify(decoded).replace(/'/g, "\\'")}');
          window.location.href = '/dashboard.html';
        </script>
      `;

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Login Successful</title>
          </head>
          <body>
            <h2>Login successful! Redirecting to dashboard...</h2>
            ${script}
          </body>
        </html>
      `);
    } catch {
      return res.status(401).json({
        message: 'Invalid token',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
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
