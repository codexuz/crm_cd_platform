import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Center } from './center.entity';

export enum SalaryStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity('teacher_salary')
export class TeacherSalary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacher_id: number;

  @Column({ nullable: true })
  center_id: number;

  @Column({ length: 7 }) // Format: YYYY-MM
  month: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: SalaryStatus,
    default: SalaryStatus.PENDING,
  })
  status: SalaryStatus;

  @Column({ nullable: true })
  hours_taught: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  hourly_rate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  bonus: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  deductions: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('date', { nullable: true })
  paid_date: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.salaries)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => Center, (center) => center.teacher_salaries)
  @JoinColumn({ name: 'center_id' })
  center: Center;
}
