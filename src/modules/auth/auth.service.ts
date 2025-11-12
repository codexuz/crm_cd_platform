import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, RoleName } from '../../entities';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with roles
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
      relations: ['roles'],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      center_id: user.center_id,
      roles: user.roles.map((role) => role.role_name),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        center_id: user.center_id,
        roles: user.roles.map((role) => role.role_name),
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, phone, password, name, center_id } = registerDto;

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

    // Get default student role
    const studentRole = await this.roleRepository.findOne({
      where: { role_name: RoleName.STUDENT },
    });

    if (!studentRole) {
      throw new Error('Student role not found');
    }

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      center_id,
      roles: [studentRole],
    });

    await this.userRepository.save(user);

    // Return login response
    return this.login({ email, password: registerDto.password });
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

  async validateGoogleUser(googleUser: {
    google_id: string;
    email: string;
    name: string;
    avatar_url: string;
    provider: string;
    accessToken: string;
  }): Promise<any> {
    // Check if user already exists by google_id or email
    let user = await this.userRepository.findOne({
      where: [
        { google_id: googleUser.google_id },
        { email: googleUser.email },
      ],
      relations: ['roles'],
    });

    if (user) {
      // Update existing user with Google information if needed
      if (!user.google_id) {
        user.google_id = googleUser.google_id;
        user.avatar_url = googleUser.avatar_url;
        user.provider = googleUser.provider;
        await this.userRepository.save(user);
      }
    } else {
      // Create new user from Google profile
      const studentRole = await this.roleRepository.findOne({
        where: { role_name: RoleName.STUDENT },
      });

      if (!studentRole) {
        throw new Error('Student role not found');
      }

      user = this.userRepository.create({
        name: googleUser.name,
        email: googleUser.email,
        google_id: googleUser.google_id,
        avatar_url: googleUser.avatar_url,
        provider: googleUser.provider,
        phone: '', // Will need to be set later
        roles: [studentRole],
      });

      await this.userRepository.save(user);
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      center_id: user.center_id,
      roles: user.roles.map((role) => role.role_name),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        center_id: user.center_id,
        avatar_url: user.avatar_url,
        provider: user.provider,
        roles: user.roles.map((role) => role.role_name),
      },
    };
  }

  async completeProfile(userId: string, profileData: { phone: string; center_id?: string }) {
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
}
