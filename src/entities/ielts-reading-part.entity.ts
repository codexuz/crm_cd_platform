import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { IeltsReading } from './ielts-reading.entity';
import { IeltsQuestion } from './ielts-question.entity';

export enum ReadingPart {
  PART_1 = 'PART_1',
  PART_2 = 'PART_2',
  PART_3 = 'PART_3',
}

@Entity('ielts_reading_parts')
export class IeltsReadingPart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  reading_id: number;

  @Column({
    type: 'enum',
    enum: ReadingPart,
  })
  part: ReadingPart;

  @Column({ nullable: true })
  question_id: number;

  @Column('longtext', { nullable: true })
  passage: string; // The reading passage/text

  @Column({ type: 'simple-json', nullable: true })
  answers: Record<string, any>; // Stores answer keys

  // Relations
  @ManyToOne(() => IeltsReading, (reading) => reading.parts)
  @JoinColumn({ name: 'reading_id' })
  reading: IeltsReading;

  @OneToOne(() => IeltsQuestion)
  @JoinColumn({ name: 'question_id' })
  question: IeltsQuestion;
}
