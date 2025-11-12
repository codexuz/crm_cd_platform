import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res, Redirect, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, CompleteProfileDto } from './dto/auth.dto';
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
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/student')
  @UseGuards(AuthGuard('google-student'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication for students' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuthStudent(@Req() req: Request) {
    // Role will be handled in the callback
  }

  @Get('google/teacher')
  @UseGuards(AuthGuard('google-teacher'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication for teachers' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuthTeacher(@Req() req: Request) {
    // Role will be handled in the callback
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth token' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { access_token, user } = req.user;
    
    // Redirect to dashboard with token stored in localStorage
    const dashboardUrl = '/dashboard.html';
    const script = `
      <script>
        localStorage.setItem('authToken', '${access_token}');
        localStorage.setItem('user', '${JSON.stringify(user).replace(/'/g, "\\'")}');
        window.location.href = '${dashboardUrl}';
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
  }

  @Get('google/student/callback')
  @UseGuards(AuthGuard('google-student'))
  @ApiOperation({ summary: 'Google OAuth callback for students' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth token' })
  async googleStudentAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { access_token, user } = req.user;
    
    // Ensure the user has student role
    const userWithRole = { ...user, roleType: 'student' };
    
    const dashboardUrl = '/dashboard.html';
    const script = `
      <script>
        localStorage.setItem('authToken', '${access_token}');
        localStorage.setItem('user', '${JSON.stringify(userWithRole).replace(/'/g, "\\'")}');
        localStorage.setItem('userType', 'student');
        window.location.href = '${dashboardUrl}';
      </script>
    `;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Login Successful</title>
        </head>
        <body>
          <h2>Student login successful! Redirecting to dashboard...</h2>
          ${script}
        </body>
      </html>
    `);
  }

  @Get('google/teacher/callback')
  @UseGuards(AuthGuard('google-teacher'))
  @ApiOperation({ summary: 'Google OAuth callback for teachers' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth token' })
  async googleTeacherAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { access_token, user } = req.user;
    
    // Ensure the user has teacher role
    const userWithRole = { ...user, roleType: 'teacher' };
    
    const dashboardUrl = '/dashboard.html';
    const script = `
      <script>
        localStorage.setItem('authToken', '${access_token}');
        localStorage.setItem('user', '${JSON.stringify(userWithRole).replace(/'/g, "\\'")}');
        localStorage.setItem('userType', 'teacher');
        window.location.href = '${dashboardUrl}';
      </script>
    `;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teacher Login Successful</title>
        </head>
        <body>
          <h2>Teacher login successful! Redirecting to dashboard...</h2>
          ${script}
        </body>
      </html>
    `);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle auth callback with token' })
  @ApiResponse({ status: 200, description: 'Processes auth token and redirects to dashboard' })
  async handleCallback(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).json({ 
        message: 'No token provided',
        error: 'Bad Request',
        statusCode: 400 
      });
    }

    // Verify the token and get user info
    try {
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
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid token',
        error: 'Unauthorized',
        statusCode: 401
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
}