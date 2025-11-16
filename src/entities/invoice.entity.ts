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
import { Subscription } from './subscription.entity';

export enum InvoiceStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum PaymentProvider {
  PAYME = 'payme',
  CLICK = 'click',
  STRIPE = 'stripe',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  center_id: string;

  @Column()
  subscription_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.CLICK,
  })
  provider: PaymentProvider;

  @Column({ length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => Subscription, (subscription) => subscription.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
