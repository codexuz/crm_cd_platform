import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Vocabulary } from './vocabulary.entity';
import { Center } from './center.entity';

export enum QuizQuestionType {
  MCQ = 'mcq',
  TRUE_FALSE = 'truefalse',
  GAP_FILL = 'gapfill',
  VOCABULARY_TRANSLATION = 'vocabulary_translation',
  VOCABULARY_DEFINITION = 'vocabulary_definition',
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

  @Column({ type: 'uuid', nullable: true })
  vocabulary_id: string;

  @ManyToOne(() => Vocabulary, { nullable: true })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @Column({ type: 'text' })
  question: string;

  @Column({
    type: 'enum',
    enum: QuizQuestionType,
  })
  type: QuizQuestionType;

  @Column({ type: 'json', nullable: true })
  options: any;

  @Column({ type: 'json' })
  correct_answer: any;

  @Column({ type: 'int' })
  order: number;
}
