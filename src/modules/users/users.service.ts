import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, RoleName } from '../../entities';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      phone,
      password,
      roles: roleNames,
      ...userData
    } = createUserDto;

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

    // Get roles
    const roles = await this.getRolesByNames(roleNames || [RoleName.STUDENT]);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      phone,
      password: hashedPassword,
      roles,
    });

    return this.userRepository.save(user);
  }

  async findAll(centerId?: string): Promise<User[]> {
    const whereCondition = centerId
      ? { center_id: centerId, is_active: true }
      : { is_active: true };

    return this.userRepository.find({
      where: whereCondition,
      relations: ['roles', 'center'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, is_active: true },
      relations: ['roles', 'center', 'assigned_leads', 'teaching_groups'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, is_active: true },
      relations: ['roles'],
    });
  }

  async findByCenter(centerId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { center_id: centerId, is_active: true },
      relations: ['roles'],
      order: { created_at: 'DESC' },
    });
  }

  async findByRole(roleName: RoleName, centerId?: string): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.center', 'center')
      .where('role.role_name = :roleName', { roleName })
      .andWhere('user.is_active = :isActive', { isActive: true });

    if (centerId) {
      query.andWhere('user.center_id = :centerId', { centerId });
    }

    return query.getMany();
  }

  async findStaff(centerId?: string): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.center', 'center')
      .where('role.role_name IN (:...roleNames)', {
        roleNames: [RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER],
      })
      .andWhere('user.is_active = :isActive', { isActive: true });

    if (centerId) {
      query.andWhere('user.center_id = :centerId', { centerId });
    }

    return query.getMany();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { roles: roleNames, ...updateData } = updateUserDto;

    // Check for email/phone conflicts if they're being updated
    if (updateData.email || updateData.phone) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: updateData.email },
          { phone: updateData.phone },
        ].filter((condition) => Object.values(condition)[0] !== undefined),
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'User with this email or phone already exists',
        );
      }
    }

    // Update roles if provided
    if (roleNames && roleNames.length > 0) {
      const roles = await this.getRolesByNames(roleNames);
      user.roles = roles;
    }

    // Update user data
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userId, { password: hashedNewPassword });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.update(id, { is_active: false });
  }

  private async getRolesByNames(roleNames: RoleName[]): Promise<Role[]> {
    const roles = await this.roleRepository.find({
      where: roleNames.map((name) => ({ role_name: name })),
    });

    if (roles.length !== roleNames.length) {
      throw new NotFoundException('Some roles not found');
    }

    return roles;
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'assigned_leads',
        'teaching_groups',
        'payments',
        'trail_lessons_taught',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      totalAssignedLeads: user.assigned_leads?.length || 0,
      totalTeachingGroups: user.teaching_groups?.length || 0,
      totalPayments: user.payments?.length || 0,
      totalTrailLessons: user.trail_lessons_taught?.length || 0,
    };
  }
}
