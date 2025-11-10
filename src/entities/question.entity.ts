import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TestSection } from './test-section.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  MATCHING = 'matching',
  FILL_IN_BLANKS = 'fill_in_blanks',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  LISTENING_MCQ = 'listening_mcq',
  LISTENING_COMPLETION = 'listening_completion',
  SPEAKING_PART1 = 'speaking_part1',
  SPEAKING_PART2 = 'speaking_part2',
  SPEAKING_PART3 = 'speaking_part3'
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  section_id: number;

  @Column({
    type: 'enum',
    enum: QuestionType
  })
  question_type: QuestionType;

  @Column('text')
  content: string;

  @Column({ length: 500, nullable: true })
  audio_url: string;

  @Column({ length: 500, nullable: true })
  image_url: string;

  @Column('text', { nullable: true })
  correct_answer: string;

  @Column('json', { nullable: true })
  options: string[]; // For multiple choice questions

  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  score: number;

  @Column({ default: 0 })
  order_number: number;

  @Column('text', { nullable: true })
  explanation: string;

  // Relations
  @ManyToOne(() => TestSection, section => section.questions)
  @JoinColumn({ name: 'section_id' })
  section: TestSection;
}