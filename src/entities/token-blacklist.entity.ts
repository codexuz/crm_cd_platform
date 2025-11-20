import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Index()
  @Column({ type: 'varchar', length: 512 })
  token: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  reason: string; // logout, expired, revoked, security

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
