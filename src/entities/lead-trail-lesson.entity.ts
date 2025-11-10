import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lead } from './lead.entity';
import { User } from './user.entity';

export enum LessonStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

@Entity('lead_trail_lessons')
export class LeadTrailLesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lead_id: number;

  @Column()
  teacher_id: number;

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.SCHEDULED
  })
  status: LessonStatus;

  @Column('text', { nullable: true })
  note: string;

  @Column()
  added_by: number;

  @Column('datetime', { nullable: true })
  lesson_date: Date;

  @Column('time', { nullable: true })
  lesson_time: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Lead, lead => lead.trail_lessons)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @ManyToOne(() => User, user => user.trail_lessons_taught)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => User, user => user.trail_lessons_added)
  @JoinColumn({ name: 'added_by' })
  added_by_user: User;
}