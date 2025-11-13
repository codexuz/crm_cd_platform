import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Lead } from './lead.entity';
import { Group } from './group.entity';
import { Payment } from './payment.entity';
import { TeacherSalary } from './teacher-salary.entity';
import { IeltsTest } from './ielts-test.entity';
import { IeltsListening } from './ielts-listening.entity';
import { IeltsReading } from './ielts-reading.entity';

@Entity('centers')
export class Center {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, unique: true, nullable: true })
  subdomain: string;

  @Column('text', { nullable: true })
  address: string;

  @Column()
  owner_id: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.owned_centers, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => User, (user) => user.center)
  users: User[];

  @OneToMany(() => Lead, (lead) => lead.center)
  leads: Lead[];

  @OneToMany(() => Group, (group) => group.center)
  groups: Group[];

  @OneToMany(() => Payment, (payment) => payment.center)
  payments: Payment[];

  @OneToMany(() => TeacherSalary, (salary) => salary.center)
  teacher_salaries: TeacherSalary[];

  @OneToMany(() => IeltsTest, (test) => test.center)
  ielts_tests: IeltsTest[];

  @OneToMany(() => IeltsListening, (listening) => listening.center)
  ielts_listenings: IeltsListening[];

  @OneToMany(() => IeltsReading, (reading) => reading.center)
  ielts_readings: IeltsReading[];
}
