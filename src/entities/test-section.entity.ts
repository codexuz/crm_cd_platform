import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Test } from './test.entity';
import { Question } from './question.entity';

export enum SectionType {
  LISTENING = 'Listening',
  READING = 'Reading',
  WRITING = 'Writing',
  SPEAKING = 'Speaking'
}

@Entity('test_sections')
export class TestSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  test_id: number;

  @Column({
    type: 'enum',
    enum: SectionType
  })
  section_type: SectionType;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column('text', { nullable: true })
  instructions: string;

  @Column({ default: 0 })
  duration: number; // Duration in minutes for this section

  @Column({ default: 0 })
  order_number: number;

  // Relations
  @ManyToOne(() => Test, test => test.sections)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @OneToMany(() => Question, question => question.section)
  questions: Question[];
}