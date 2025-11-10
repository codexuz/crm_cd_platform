import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Center } from './center.entity';
import { TestSection } from './test-section.entity';

export enum TestType {
  ACADEMIC = 'Academic',
  GENERAL = 'General'
}

export enum TestStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({
    type: 'enum',
    enum: TestType
  })
  type: TestType;

  @Column({ default: 180 }) // Duration in minutes
  duration: number;

  @Column()
  center_id: number;

  @Column({
    type: 'enum',
    enum: TestStatus,
    default: TestStatus.DRAFT
  })
  status: TestStatus;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  instructions: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Center, center => center.tests)
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @OneToMany(() => TestSection, section => section.test)
  sections: TestSection[];
}