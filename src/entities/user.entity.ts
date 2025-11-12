import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Center } from './center.entity';
import { Role } from './role.entity';
import { Lead } from './lead.entity';
import { Group } from './group.entity';
import { Payment } from './payment.entity';
import { LeadTrailLesson } from './lead-trail-lesson.entity';
import { TeacherSalary } from './teacher-salary.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ length: 255, nullable: true, unique: true })
  google_id: string;

  @Column({ length: 500, nullable: true })
  avatar_url: string;

  @Column({ length: 50, default: 'local' })
  provider: string; // 'local', 'google', etc.

  @Column({ nullable: true })
  center_id: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, (center) => center.users, { nullable: true })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Lead, (lead) => lead.assigned_to_user)
  assigned_leads: Lead[];

  @OneToMany(() => Group, (group) => group.teacher)
  teaching_groups: Group[];

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];

  @OneToMany(() => LeadTrailLesson, (lesson) => lesson.teacher)
  trail_lessons_taught: LeadTrailLesson[];

  @OneToMany(() => LeadTrailLesson, (lesson) => lesson.added_by_user)
  trail_lessons_added: LeadTrailLesson[];

  @OneToMany(() => TeacherSalary, (salary) => salary.teacher)
  salaries: TeacherSalary[];
}
