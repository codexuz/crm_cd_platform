import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Center } from './center.entity';
import { IeltsTest } from './ielts-test.entity';

@Entity('student_assigned_tests')
export class StudentAssignedTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  candidate_id: string; // 10-digit unique candidate ID

  @Column({ type: 'uuid' })
  student_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'uuid' })
  test_id: string;

  @ManyToOne(() => IeltsTest)
  @JoinColumn({ name: 'test_id' })
  test: IeltsTest;

  @Column({ type: 'uuid' })
  center_id: string;

  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'uuid' })
  assigned_by: string; // Teacher who assigned the test

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  teacher: User;

  @Column({ type: 'datetime', nullable: true })
  test_start_time?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  test_end_time?: Date | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'expired'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  completed_at?: Date | null;

  @Column({ type: 'json', nullable: true })
  test_results?: any;

  @Column({ type: 'json', nullable: true })
  listening_final?: any; // Checked listening results: { correct, incorrect, score, totalQuestions }

  @Column({ type: 'json', nullable: true })
  reading_final?: any; // Checked reading results: { correct, incorrect, score, totalQuestions }

  @Column({ type: 'json', nullable: true })
  writing_final?: any; // Checked writing results: { task1Score, task2Score, averageScore, feedback }

  @Column({ type: 'json', nullable: true })
  speaking_final?: any; // Checked speaking results: { overall, feedback }

  @Column({ type: 'text', nullable: true })
  notes?: string | null; // Teacher notes

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
