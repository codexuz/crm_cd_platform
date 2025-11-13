import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IeltsWriting } from './ielts-writing.entity';

export enum WritingTask {
  TASK_1 = 'TASK_1',
  TASK_2 = 'TASK_2',
}

export enum WritingTaskType {
  ACADEMIC_TASK_1 = 'academic_task_1', // Describe visual information (graph, chart, diagram)
  GENERAL_TASK_1 = 'general_task_1', // Write a letter
  TASK_2 = 'task_2', // Essay (same for both Academic and General)
}

@Entity('ielts_writing_tasks')
export class IeltsWritingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  writing_id: string;

  @Column({
    type: 'enum',
    enum: WritingTask,
  })
  task: WritingTask;

  @Column({
    type: 'enum',
    enum: WritingTaskType,
  })
  task_type: WritingTaskType;

  @Column('text')
  prompt: string; // The writing task prompt/question

  @Column('text', { nullable: true })
  visual_url: string; // URL to image/chart/graph for Academic Task 1

  @Column({ type: 'int', default: 150 })
  min_words: number; // Minimum word count (150 for Task 1, 250 for Task 2)

  @Column({ type: 'int', default: 20 })
  time_minutes: number; // Suggested time (20 min for Task 1, 40 min for Task 2)

  @Column('json', { nullable: true })
  sample_answer: {
    text?: string;
    band_score?: number;
    examiner_comments?: string;
  };

  @Column('json', { nullable: true })
  assessment_criteria: {
    task_achievement?: string;
    coherence_cohesion?: string;
    lexical_resource?: string;
    grammatical_range?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => IeltsWriting, (writing) => writing.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'writing_id' })
  writing: IeltsWriting;
}
