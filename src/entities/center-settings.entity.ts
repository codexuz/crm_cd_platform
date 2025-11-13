import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Center } from './center.entity';

export enum ModuleName {
  LEADS = 'leads',
  PAYMENTS = 'payments',
  SALARY = 'salary',
  GROUPS = 'groups',
  ATTENDANCE = 'attendance',
  IELTS = 'ielts',
}

@Entity('center_settings')
@Unique(['center_id', 'module_name'])
export class CenterSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  center_id: string;

  @Column({
    type: 'enum',
    enum: ModuleName,
  })
  module_name: ModuleName;

  @Column({ default: true })
  is_enabled: boolean;

  @Column('json', { nullable: true })
  module_config: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;
}
