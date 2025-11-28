import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseModule } from './course-module.entity';
import { Center } from './center.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  module_id: string;

  @Column({ type: 'uuid' })
  center_id: string;

  @ManyToOne(() => CourseModule)
  @JoinColumn({ name: 'module_id' })
  module: CourseModule;

  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'json', nullable: true })
  content: any;

  @Column({ type: 'text', nullable: true })
  video_url: string;

  @Column({ type: 'int' })
  order: number;
}
