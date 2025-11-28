import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Quiz } from './quiz.entity';
import { Center } from './center.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  center_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'uuid' })
  quiz_id: string;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'boolean' })
  is_passed: boolean;

  @Column({ type: 'int' })
  attempt_number: number;

  @Column({ type: 'timestamp' })
  submitted_at: Date;
}
