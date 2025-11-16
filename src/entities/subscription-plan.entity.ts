import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_month: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_year: number;

  @Column({ length: 10, default: 'USD' })
  currency: string; // UZS / USD

  @Column('text', { nullable: true })
  description: string;

  @Column('json')
  features: {
    leads?: boolean;
    groups?: boolean;
    payments?: boolean;
    salary?: boolean;
    attendance?: boolean;
    ielts?: boolean;
    max_users?: number;
    max_students?: number;
    max_groups?: number;
    max_storage_gb?: number;
    custom_branding?: boolean;
    priority_support?: boolean;
    api_access?: boolean;
    advanced_reporting?: boolean;
    [key: string]: any;
  };

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
