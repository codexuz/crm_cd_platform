import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Center } from './center.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  lesson_id: string;

  @Column({ type: 'uuid' })
  center_id: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  time_limit: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
