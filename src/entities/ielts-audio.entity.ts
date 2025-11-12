import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Center } from './center.entity';
import { User } from './user.entity';

@Entity('ielts_audio')
export class IeltsAudio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  url: string; // URL to the audio file (could be MinIO, S3, etc.)

  @Column({ length: 255, nullable: true })
  file_name: string;

  @Column({ nullable: true })
  duration: number; // Duration in seconds

  @Column({ nullable: true })
  file_size: number; // File size in bytes

  @Column({ nullable: true })
  center_id: string;

  @Column({ nullable: true })
  uploaded_by: string;

  @CreateDateColumn()
  uploaded_at: Date;

  // Relations
  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}
