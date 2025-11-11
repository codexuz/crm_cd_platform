import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Lead } from './lead.entity';
import { Group } from './group.entity';
import { Payment } from './payment.entity';
import { Test } from './test.entity';
import { Role } from './role.entity';

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Entity('centers')
export class Center {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, unique: true, nullable: true })
  subdomain: string;

  @Column('text', { nullable: true })
  address: string;

  @Column()
  owner_id: number;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  // Subscription & Tenant Management
  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscription_plan: SubscriptionPlan;

  @Column({ type: 'date', nullable: true })
  subscription_start_date: Date;

  @Column({ type: 'date', nullable: true })
  subscription_end_date: Date;

  @Column({ default: 10 })
  max_users: number; // Based on subscription plan

  @Column({ default: 100 })
  max_students: number; // Based on subscription plan

  @Column({ type: 'simple-json', nullable: true })
  features: string[]; // List of enabled features based on plan

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => User, (user) => user.center)
  users: User[];

  @OneToMany(() => Lead, (lead) => lead.center)
  leads: Lead[];

  @OneToMany(() => Group, (group) => group.center)
  groups: Group[];

  @OneToMany(() => Payment, (payment) => payment.center)
  payments: Payment[];

  @OneToMany(() => Test, (test) => test.center)
  tests: Test[];

  @OneToMany(() => Role, (role) => role.center)
  roles: Role[];
}
