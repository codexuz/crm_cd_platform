import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';
import { IeltsListening } from './ielts-listening.entity';
import { IeltsReading } from './ielts-reading.entity';
import { IeltsWriting } from './ielts-writing.entity';

export enum TestType {
  IELTS_PRACTICE = 'ielts_practice',
  IELTS_MOCK = 'ielts_mock',
  CEFR_PRACTICE = 'cefr_practice',
  CEFR_MOCK = 'cefr_mock',
}

@Entity('ielts_tests')
export class IeltsTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  center_id: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({
    type: 'enum',
    enum: TestType,
    default: TestType.IELTS_PRACTICE,
  })
  test_type: TestType;

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
  listening: IeltsListening;

  @OneToOne(() => IeltsReading, (reading) => reading.test)
  reading: IeltsReading;

  @OneToOne(() => IeltsWriting, (writing) => writing.test)
  writing: IeltsWriting;
}
