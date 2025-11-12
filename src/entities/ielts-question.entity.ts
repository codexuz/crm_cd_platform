import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Center } from './center.entity';

export enum QuestionContentType {
  COMPLETION = 'completion', // Fill in the blanks with @@
  MULTIPLE_CHOICE = 'multiple-choice', // A, B, C options
  MULTI_SELECT = 'multi-select', // Choose TWO letters
  SELECTION = 'selection', // YES/NO/NOT GIVEN or TRUE/FALSE/NOT GIVEN
  DRAGGABLE_SELECTION = 'draggable-selection', // Drag and drop matching
  MATCHING = 'matching', // Match headings to paragraphs
}

@Entity('ielts_questions')
export class IeltsQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  center_id: string;

  @Column({ type: 'simple-json' })
  content: QuestionContent[]; // Array of question sections

  @Column({ default: 10 })
  number_of_questions: number;

  // Relations
  @ManyToOne(() => Center)
  @JoinColumn({ name: 'center_id' })
  center: Center;
}

// Interface for question content structure
export interface QuestionContent {
  id: string;
  type: QuestionContentType;
  title?: string;
  condition?: string; // Instructions for the question
  content?: string; // HTML content with @@ placeholders for completion type
  questions?: MultipleChoiceQuestion[]; // For multiple-choice type
  options?: Option[]; // For selection, multi-select, and draggable
  limit?: number; // For multi-select (how many to choose)
  showOptions?: boolean;
  optionsTitle?: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: Option[];
}

export interface Option {
  id: string;
  value: string;
  label: string;
}
