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
import { IeltsTest } from './ielts-test.entity';
import { User } from './user.entity';
import { Center } from './center.entity';
import { TestResult } from './test-result.entity';

export enum TestAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('test_assignments')
export class TestAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  test_id: number;

  @Column()
  student_id: number;

  @Column()
  center_id: number;

  @Column({ nullable: true })
  assigned_by_user_id: number;

  @Column({
    type: 'enum',
    enum: TestAssignmentStatus,
    default: TestAssignmentStatus.ASSIGNED,
  })
  status: TestAssignmentStatus;

  @Column({ type: 'datetime', nullable: true })
  start_time: Date;

  @Column({ type: 'datetime', nullable: true })
  end_time: Date;

  @Column({ type: 'datetime' })
  due_date: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'int', default: 1 })
  max_attempts: number;

  @Column({ type: 'int', nullable: true })
  time_limit_minutes: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => IeltsTest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: IeltsTest;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Center, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assigned_by: User;

  @OneToMany(() => TestResult, (result: TestResult) => result.assignment)
  results: TestResult[];
}