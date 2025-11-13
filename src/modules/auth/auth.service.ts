import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, RoleName, Center } from '../../entities';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

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
  ) {}

  async login(loginDto: LoginDto) {
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

    // Check if user has a password (local auth) and compare
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google login. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
    preferredRole?: string;
  }): Promise<any> {
    // Check if user already exists by google_id or email
    let user = await this.userRepository.findOne({
      where: [{ google_id: googleUser.google_id }, { email: googleUser.email }],
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
      let targetRole = RoleName.STUDENT; // default

      if (googleUser.preferredRole === 'teacher') {
        targetRole = RoleName.TEACHER;
      } else if (googleUser.preferredRole === 'student') {
        targetRole = RoleName.STUDENT;
      } else if (googleUser.preferredRole === 'owner') {
        targetRole = RoleName.OWNER;
      }

      const role = await this.roleRepository.findOne({
        where: { role_name: targetRole },
      });

      if (!role) {
        throw new Error(`${targetRole} role not found`);
      }

      user = this.userRepository.create({
        name: googleUser.name,
        email: googleUser.email,
        google_id: googleUser.google_id,
        avatar_url: googleUser.avatar_url,
        provider: googleUser.provider,
        phone: null, // Will be set later when user completes profile
        roles: [role],
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
}
