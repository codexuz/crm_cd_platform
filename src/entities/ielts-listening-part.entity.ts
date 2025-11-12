import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { IeltsListening } from './ielts-listening.entity';
import { IeltsQuestion } from './ielts-question.entity';
import { IeltsAudio } from './ielts-audio.entity';

export enum ListeningPart {
  PART_1 = 'PART_1',
  PART_2 = 'PART_2',
  PART_3 = 'PART_3',
  PART_4 = 'PART_4',
}

@Entity('ielts_listening_parts')
export class IeltsListeningPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  listening_id: string;

  @Column({
    type: 'enum',
    enum: ListeningPart,
  })
  part: ListeningPart;

  @Column({ nullable: true })
  question_id: string;

  @Column({ nullable: true })
  audio_id: string;

  @Column({ type: 'simple-json', nullable: true })
  answers: Record<string, any>; // Stores answer keys

  // Relations
  @ManyToOne(() => IeltsListening, (listening) => listening.parts)
  @JoinColumn({ name: 'listening_id' })
  listening: IeltsListening;

  @OneToOne(() => IeltsQuestion)
  @JoinColumn({ name: 'question_id' })
  question: IeltsQuestion;

  @OneToOne(() => IeltsAudio)
  @JoinColumn({ name: 'audio_id' })
  audio: IeltsAudio;
}
