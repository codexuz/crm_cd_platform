import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

export enum PrivilegeName {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_ASSIGN_ROLES = 'user:assign_roles',

  // Role Management
  ROLE_CREATE = 'role:create',
  ROLE_READ = 'role:read',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_ASSIGN_PRIVILEGES = 'role:assign_privileges',

  // Center/Tenant Management
  CENTER_CREATE = 'center:create',
  CENTER_READ = 'center:read',
  CENTER_UPDATE = 'center:update',
  CENTER_DELETE = 'center:delete',
  CENTER_MANAGE_SUBSCRIPTION = 'center:manage_subscription',

  // Lead Management
  LEAD_CREATE = 'lead:create',
  LEAD_READ = 'lead:read',
  LEAD_UPDATE = 'lead:update',
  LEAD_DELETE = 'lead:delete',
  LEAD_ASSIGN = 'lead:assign',

  // Group Management
  GROUP_CREATE = 'group:create',
  GROUP_READ = 'group:read',
  GROUP_UPDATE = 'group:update',
  GROUP_DELETE = 'group:delete',

  // Payment Management
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_READ = 'payment:read',
  PAYMENT_UPDATE = 'payment:update',
  PAYMENT_DELETE = 'payment:delete',

  // Salary Management
  SALARY_CREATE = 'salary:create',
  SALARY_READ = 'salary:read',
  SALARY_UPDATE = 'salary:update',
  SALARY_DELETE = 'salary:delete',
  SALARY_APPROVE = 'salary:approve',

  // Test Management
  TEST_CREATE = 'test:create',
  TEST_READ = 'test:read',
  TEST_UPDATE = 'test:update',
  TEST_DELETE = 'test:delete',

  // Reports
  REPORT_VIEW_ALL = 'report:view_all',
  REPORT_EXPORT = 'report:export',

  // System Management (Super Admin Only)
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_MANAGE_ALL_TENANTS = 'system:manage_all_tenants',
  SYSTEM_VIEW_ALL_DATA = 'system:view_all_data',
}

@Entity('privileges')
export class Privilege {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  privilege_name: PrivilegeName;

  @Column({ length: 100 })
  display_name: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ length: 50 })
  category: string; // e.g., 'user_management', 'lead_management', etc.

  @Column({ default: false })
  is_super_admin_only: boolean; // Can only be assigned to super admin

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToMany(() => Role, (role) => role.privileges)
  roles: Role[];
}
