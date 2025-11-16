import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Center } from './center.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Invoice } from './invoice.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  center_id: string;

  @Column()
  plan_id: string;

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
  trial_ends_at: Date;

  @Column({ type: 'date', nullable: true })
  renews_at: Date;

  @Column({ default: false })
  cancel_at_period_end: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @OneToMany(() => Invoice, (invoice) => invoice.subscription)
  invoices: Invoice[];
}
