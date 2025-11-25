import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

export enum QuizType {
  GENERAL = 'general',
  VOCABULARY = 'vocabulary',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  lesson_id: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({
    type: 'enum',
    enum: QuizType,
    default: QuizType.GENERAL,
  })
  quiz_type: QuizType;

  @Column({ type: 'boolean', default: false })
  vocabulary_based: boolean;

  @Column({ type: 'int', nullable: true })
  time_limit: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
