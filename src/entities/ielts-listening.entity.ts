import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';
import { IeltsListeningPart } from './ielts-listening-part.entity';
import { IeltsTest } from './ielts-test.entity';

@Entity('ielts_listening')
export class IeltsListening {
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

  @Column({ default: false })
  for_cdi: boolean;

  @Column({ nullable: true })
  test_id: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, (center) => center.ielts_listenings)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany(() => IeltsListeningPart, (part) => part.listening)
  parts: IeltsListeningPart[];

  @OneToOne(() => IeltsTest, (test) => test.listening)
  @JoinColumn({ name: 'test_id' })
  test: IeltsTest;
}
