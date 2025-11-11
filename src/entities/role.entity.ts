import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Center } from './center.entity';
import { Privilege } from './privilege.entity';

export enum RoleName {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  CUSTOM = 'custom', // For custom roles created by tenant admins
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleName,
  })
  role_name: RoleName;

  @Column({ length: 100 })
  display_name: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @Column({ nullable: true })
  center_id: number | null; // Null for super admin roles, specific for tenant roles

  @Column({ default: false })
  is_system_role: boolean; // True for predefined roles (super_admin, admin, etc.)

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, (center) => center.roles, { nullable: true })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Privilege, (privilege) => privilege.roles)
  @JoinTable({
    name: 'role_privileges',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'privilege_id', referencedColumnName: 'id' },
  })
  privileges: Privilege[];
}
