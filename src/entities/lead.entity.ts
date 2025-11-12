import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';
import { LeadTrailLesson } from './lead-trail-lesson.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  INTERESTED = 'interested',
  ENROLLED = 'enrolled',
  REJECTED = 'rejected',
  LOST = 'lost'
}

export enum InterestLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: InterestLevel,
    default: InterestLevel.MEDIUM
  })
  interest_level: InterestLevel;

  @Column({ nullable: true })
  assigned_to: string;

  @Column()
  center_id: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW
  })
  status: LeadStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column('date', { nullable: true })
  follow_up_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, center => center.leads)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User, user => user.assigned_leads, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assigned_to_user: User;

  @OneToMany(() => LeadTrailLesson, lesson => lesson.lead)
  trail_lessons: LeadTrailLesson[];
}