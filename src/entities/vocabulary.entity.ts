import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Center } from './center.entity';

@Entity('vocabulary')
export class Vocabulary {
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

  @Column({ type: 'text' })
  word: string;

  @Column({ type: 'text' })
  uz: string;

  @Column({ type: 'text' })
  ru: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({ type: 'text', nullable: true })
  audio_url: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'int' })
  order: number;
}
