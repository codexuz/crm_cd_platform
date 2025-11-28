import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Center } from './center.entity';

export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_THE_BLANK = 'fill_in_the_blank',
  TYPING = 'typing',
}

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quiz_id: string;

  @Column({ type: 'uuid' })
  center_id: string;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({
    type: 'enum',
    enum: QuizQuestionType,
  })
  type: QuizQuestionType;

  @Column({ type: 'json', nullable: true })
  options: any;

  @Column({ type: 'json' })
  correct_answer: any;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ type: 'int' })
  order: number;
}
