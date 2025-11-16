import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, RoleName, Center } from '../../entities';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { JwtPayload } from './jwt.strategy';
import { EmailService } from '../email/email.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private sessionService: SessionService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;

    // Find user with roles and explicitly select password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.email = :email', { email })
      .andWhere('user.is_active = :is_active', { is_active: true })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
      );
    }

    // Check if user has a password and compare
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate OTP for login
    const otp = this.generateOtp();

    // Set expiration (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    user.login_otp = otp;
    user.login_otp_expires = expiresAt;
    await this.userRepository.save(user);

    // Send OTP email
    try {
      await this.emailService.sendLoginOtpEmail(user.email, otp, user.name);
    } catch (error) {
      console.error('Failed to send login OTP email:', error);
      throw new BadRequestException('Failed to send login verification code');
    }

    return {
      message: 'Login verification code sent to your email',
      email: user.email,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, phone, password, name, center_id, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or phone already exists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine the role to assign (default to STUDENT if not provided)
    const roleName = role || RoleName.STUDENT;

    // Get the specified role
    const userRole = await this.roleRepository.findOne({
      where: { role_name: roleName },
    });

    if (!userRole) {
      throw new Error(`${roleName} role not found`);
    }

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      center_id,
      roles: [userRole],
    });

    await this.userRepository.save(user);

    // Generate and send OTP for email verification
    try {
      await this.sendVerificationOtp(user.email);
    } catch (error) {
      console.error('Failed to send verification OTP:', error);
    }

    // Return message instead of auto-login
    return {
      message:
        'Registration successful. Please check your email for verification code.',
      email: user.email,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, is_active: true },
      relations: ['roles'],
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      center_id: user.center_id,
      roles: user.roles.map((role) => role.role_name),
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationOtp(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate OTP
    const otp = this.generateOtp();

    // Set expiration (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    user.email_verification_otp = otp;
    user.email_verification_otp_expires = expiresAt;
    await this.userRepository.save(user);

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.name);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification code sent to your email' };
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
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
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.email_verification_otp) {
      throw new BadRequestException(
        'No verification code found. Please request a new one.',
      );
    }

    // Check if OTP is expired
    if (
      !user.email_verification_otp_expires ||
      new Date() > user.email_verification_otp_expires
    ) {
      throw new BadRequestException(
        'Verification code expired. Please request a new one.',
      );
    }

    // Verify OTP
    if (user.email_verification_otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    // Mark email as verified
    user.email_verified = true;
    user.email_verification_otp = null;
    user.email_verification_otp_expires = null;
    await this.userRepository.save(user);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    // Generate JWT token and return login response
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      center_id: user.center_id,
      roles: user.roles.map((role) => role.role_name),
    };

    const access_token = this.jwtService.sign(payload);

    // Create session
    await this.sessionService.createSession(
      user.id,
      access_token,
      ipAddress,
      userAgent,
    );

    return {
      message: 'Email verified successfully',
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        center_id: user.center_id,
        roles: user.roles.map((role) => role.role_name),
      },
    };
  }

  async resendVerificationOtp(email: string): Promise<{ message: string }> {
    return this.sendVerificationOtp(email);
  }

  async verifyLoginOtp(
    email: string,
    otp: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
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
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.login_otp) {
      throw new BadRequestException(
        'No login verification code found. Please log in again.',
      );
    }

    // Check if OTP is expired
    if (!user.login_otp_expires || new Date() > user.login_otp_expires) {
      throw new BadRequestException(
        'Login verification code expired. Please log in again.',
      );
    }

    // Verify OTP
    if (user.login_otp !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    // Clear login OTP
    user.login_otp = null;
    user.login_otp_expires = null;
    await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      center_id: user.center_id,
      roles: user.roles.map((role) => role.role_name),
    };

    const access_token = this.jwtService.sign(payload);

    // Create session
    await this.sessionService.createSession(
      user.id,
      access_token,
      ipAddress,
      userAgent,
    );

    return {
      message: 'Login successful',
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        center_id: user.center_id,
        roles: user.roles.map((role) => role.role_name),
      },
    };
  }

  async logout(token: string, userId: string): Promise<{ message: string }> {
    // Blacklist the token
    await this.sessionService.blacklistToken(token, userId, 'logout');

    // Mark session as inactive
    const sessions = await this.sessionService.getUserSessions(userId);
    const currentSession = sessions.find((s) => s.token === token);

    if (currentSession) {
      await this.sessionService.revokeSession(currentSession.id, userId);
    }

    return { message: 'Logged out successfully' };
  }

  async completeProfile(
    userId: string,
    profileData: { phone: string; center_id?: string },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user with profile completion data
    user.phone = profileData.phone;
    if (profileData.center_id) {
      user.center_id = profileData.center_id;
    }

    await this.userRepository.save(user);

    return {
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        center_id: user.center_id,
        avatar_url: user.avatar_url,
        provider: user.provider,
        roles: user.roles.map((role) => role.role_name),
      },
    };
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async registerCenter(
    userId: string,
    centerData: {
      name: string;
      subdomain?: string;
      address?: string;
      phone?: string;
      email?: string;
      description?: string;
    },
  ) {
    // Verify user is an owner
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOwner = user.roles.some(
      (role) => role.role_name === RoleName.OWNER,
    );
    if (!isOwner) {
      throw new UnauthorizedException('Only owners can register centers');
    }

    // Generate subdomain from name if not provided
    let subdomain = centerData.subdomain;
    if (!subdomain && centerData.name) {
      const slug = this.generateSubdomainFromName(centerData.name);
      subdomain = await this.getUniqueSubdomain(slug);
    }

    // Create center
    const center = this.centerRepository.create({
      ...centerData,
      subdomain,
      owner_id: userId,
      is_active: true,
    });

    const savedCenter = await this.centerRepository.save(center);

    // Update user's center_id
    user.center_id = savedCenter.id;
    await this.userRepository.save(user);

    return {
      message: 'Center registered successfully',
      center: {
        id: savedCenter.id,
        name: savedCenter.name,
        subdomain: savedCenter.subdomain,
        address: savedCenter.address,
        phone: savedCenter.phone,
        email: savedCenter.email,
        description: savedCenter.description,
      },
    };
  }

  private generateSubdomainFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  private async getUniqueSubdomain(baseSubdomain: string): Promise<string> {
    let subdomain = baseSubdomain;
    let counter = 1;

    while (await this.isSubdomainTaken(subdomain)) {
      subdomain = `${baseSubdomain}${counter}`;
      counter++;
    }

    return subdomain;
  }

  private async isSubdomainTaken(subdomain: string): Promise<boolean> {
    const existing = await this.centerRepository.findOne({
      where: { subdomain },
    });
    return !!existing;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Check if user has password (not OAuth user)
    if (!user.password) {
      return {
        message: 'This account uses Google login. Please sign in with Google.',
      };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' },
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Verify token
    let payload: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = this.jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    // Find user
    const user = await this.userRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      where: { id: payload.sub, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }
}
