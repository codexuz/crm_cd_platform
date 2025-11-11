import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';
import { IeltsListening } from './ielts-listening.entity';
import { IeltsReading } from './ielts-reading.entity';

@Entity('ielts_tests')
export class IeltsTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  center_id: number;

  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @Column({ default: false })
  for_cdi: boolean; // For CDI (Cambridge, etc.)

  @Column({ nullable: true })
  listening_id: number;

  @Column({ nullable: true })
  reading_id: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, (center) => center.ielts_tests)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToOne(() => IeltsListening, (listening) => listening.test)
  @JoinColumn({ name: 'listening_id' })
  listening: IeltsListening;

  @OneToOne(() => IeltsReading, (reading) => reading.test)
  @JoinColumn({ name: 'reading_id' })
  reading: IeltsReading;
}
