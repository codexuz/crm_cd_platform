import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TestAssignment } from './test-assignment.entity';
import { User } from './user.entity';
import { Center } from './center.entity';

export enum TestResultStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EXPIRED = 'expired',
}

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assignment_id: number;

  @Column()
  student_id: number;

  @Column()
  center_id: number;

  @Column({
    type: 'enum',
    enum: TestResultStatus,
    default: TestResultStatus.STARTED,
  })
  status: TestResultStatus;

  @Column({ type: 'datetime' })
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  // Listening scores
  @Column({ type: 'json', nullable: true })
  listening_answers: Record<string, any>;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  listening_score: number;

  @Column({ type: 'int', nullable: true })
  listening_correct_answers: number;

  @Column({ type: 'int', nullable: true })
  listening_total_questions: number;

  // Reading scores
  @Column({ type: 'json', nullable: true })
  reading_answers: Record<string, any>;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  reading_score: number;

  @Column({ type: 'int', nullable: true })
  reading_correct_answers: number;

  @Column({ type: 'int', nullable: true })
  reading_total_questions: number;

  // Overall scores
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  overall_score: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  band_score: number;

  @Column({ type: 'json', nullable: true })
  detailed_feedback: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  teacher_comments: string;

  @Column({ type: 'boolean', default: false })
  is_reviewed: boolean;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'int', nullable: true })
  reviewed_by_user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => TestAssignment, (assignment) => assignment.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignment_id' })
  assignment: TestAssignment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Center, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewed_by: User;
}