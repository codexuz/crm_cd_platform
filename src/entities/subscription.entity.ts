import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Center } from './center.entity';

export enum SubscriptionPlan {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  center_id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  plan_type: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'date', nullable: true })
  trial_end_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ length: 50, default: 'monthly' })
  billing_cycle: string; // monthly, yearly, lifetime

  @Column({ default: false })
  auto_renew: boolean;

  @Column('json', { nullable: true })
  features: {
    max_users?: number;
    max_students?: number;
    max_groups?: number;
    max_storage_gb?: number;
    enabled_modules?: string[];
    custom_branding?: boolean;
    priority_support?: boolean;
    api_access?: boolean;
    advanced_reporting?: boolean;
    [key: string]: any;
  };

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;
}
