import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('date')
  date: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED
  })
  status: PaymentStatus;

  @Column()
  center_id: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  reference_number: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Center, center => center.payments)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User, user => user.payments)
  @JoinColumn({ name: 'student_id' })
  student: User;
}