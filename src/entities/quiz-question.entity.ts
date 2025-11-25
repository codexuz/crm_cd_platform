import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Vocabulary } from './vocabulary.entity';

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

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

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
