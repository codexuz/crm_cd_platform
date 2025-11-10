import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';

export enum GroupLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  PRE_INTERMEDIATE = 'pre-intermediate',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper-intermediate',
  ADVANCED = 'advanced'
}

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  group_name: string;

  @Column({
    type: 'enum',
    enum: GroupLevel
  })
  level: GroupLevel;

  @Column()
  teacher_id: number;

  @Column()
  center_id: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('time', { nullable: true })
  class_time: string;

  @Column({ nullable: true })
  max_students: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, center => center.groups)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User, user => user.teaching_groups)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'group_students',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' }
  })
  students: User[];
}