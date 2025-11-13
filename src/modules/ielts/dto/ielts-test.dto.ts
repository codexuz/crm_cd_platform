import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionContentType } from '../../../entities';

export class CreateIeltsTestDto {
  @ApiProperty({
    description: 'Title of the IELTS test',
    example: 'IELTS Academic Test - Practice Set 1',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the IELTS test',
    example:
      'This is a comprehensive IELTS Academic test designed for intermediate to advanced students preparing for their IELTS examination.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this test is for CDI (Cambridge Development Institute)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;
}

export class UpdateIeltsTestDto {
  @ApiPropertyOptional({
    description: 'Title of the IELTS test',
    example: 'IELTS Academic Test - Practice Set 1 (Updated)',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the IELTS test',
    example:
      'Updated comprehensive IELTS Academic test with new questions and improved structure.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this test is for CDI (Cambridge Development Institute)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the test is active/available',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Define base classes first (used by Type() decorators)
export class QuestionContentDto {
  @ApiProperty({
    description: 'Unique identifier for the question content',
    example: 'qc_001',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Type of question content',
    enum: QuestionContentType,
    example: QuestionContentType.MULTIPLE_CHOICE,
  })
  @IsEnum(QuestionContentType)
  type: QuestionContentType;

  @ApiPropertyOptional({
    description: 'Title of the question content section',
    example: 'Multiple Choice Questions',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Condition or instruction for this content',
    example: 'Choose the correct answer from the options below',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'The main content text',
    example: 'Listen to the conversation and answer the following questions.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Array of questions',
    example: [
      {
        id: 1,
        text: 'What is the main topic of the conversation?',
        type: 'multiple_choice',
      },
      {
        id: 2,
        text: 'Where does the conversation take place?',
        type: 'fill_blank',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  questions?: any[];

  @ApiPropertyOptional({
    description: 'Array of answer options',
    example: [
      'A) In a library',
      'B) In a restaurant',
      'C) In a bookstore',
      'D) In a museum',
    ],
  })
  @IsOptional()
  @IsArray()
  options?: any[];

  @ApiPropertyOptional({
    description: 'Time limit in minutes',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Whether to show answer options',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showOptions?: boolean;

  @ApiPropertyOptional({
    description: 'Title for the options section',
    example: 'Choose from the following options:',
  })
  @IsOptional()
  @IsString()
  optionsTitle?: string;
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Array of question content sections',
    type: [QuestionContentDto],
    example: [
      {
        id: 'qc_001',
        type: 'multiple-choice',
        title: 'Listening Section',
        condition: 'Choose the correct answer',
        questions: [
          {
            id: 1,
            text: 'What is the speaker talking about?',
            type: 'multiple_choice',
          },
        ],
        options: ['A) Work', 'B) School', 'C) Travel', 'D) Food'],
      },
    ],
  })
  @IsArray()
  content: QuestionContentDto[];

  @ApiProperty({
    description: 'Total number of questions in this section',
    example: 10,
  })
  @IsNumber()
  number_of_questions: number;
}

export class CreateAudioDto {
  @ApiProperty({
    description: 'URL of the audio file',
    example: 'https://example.com/audio/ielts-listening-part1.mp3',
  })
  @IsString()
  url: string;

  @ApiPropertyOptional({
    description: 'Name of the audio file',
    example: 'ielts-listening-part1.mp3',
  })
  @IsOptional()
  @IsString()
  file_name?: string;

  @ApiPropertyOptional({
    description: 'Duration of the audio in seconds',
    example: 180,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 2048576,
  })
  @IsOptional()
  @IsNumber()
  file_size?: number;
}

// Now define classes that use the above classes
export class CreateListeningPartDto {
  @ApiProperty({
    description: 'Listening part identifier',
    enum: ['PART_1', 'PART_2', 'PART_3', 'PART_4'],
    example: 'PART_1',
  })
  @IsEnum(['PART_1', 'PART_2', 'PART_3', 'PART_4'])
  part: string;

  @ApiProperty({
    description: 'Question configuration for this listening part',
    type: CreateQuestionDto,
  })
  @ValidateNested()
  @Type(() => CreateQuestionDto)
  question: CreateQuestionDto;

  @ApiProperty({
    description: 'Audio configuration for this listening part',
    type: CreateAudioDto,
  })
  @ValidateNested()
  @Type(() => CreateAudioDto)
  audio: CreateAudioDto;

  @ApiPropertyOptional({
    description: 'Answer key for this listening part',
    example: {
      '1': 'A',
      '2': 'kitchen',
      '3': 'B',
      '4': 'library',
    },
  })
  @IsOptional()
  answers?: Record<string, any>;
}

export class CreateListeningDto {
  @ApiProperty({
    description: 'Title of the listening test',
    example: 'IELTS Listening Test - Academic Module',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the listening test',
    example:
      'A comprehensive listening test with 4 parts covering everyday conversations and academic lectures.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this test is for CDI (Cambridge Development Institute)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the associated IELTS test',
    example: 'uuid-string-test',
  })
  @IsOptional()
  @IsString()
  test_id?: string;

  @ApiProperty({
    description: 'Array of listening parts (1-4)',
    type: [CreateListeningPartDto],
    example: [
      {
        part: 'PART_1',
        question: {
          content: [
            {
              id: 'lp1_001',
              type: 'completion',
              title: 'Form Completion',
              condition:
                'Complete the form below. Write NO MORE THAN TWO WORDS for each answer.',
            },
          ],
          number_of_questions: 10,
        },
        audio: {
          url: 'https://example.com/audio/part1.mp3',
          file_name: 'listening_part1.mp3',
          duration: 300,
        },
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListeningPartDto)
  parts: CreateListeningPartDto[];
}

export class CreateReadingPartDto {
  @ApiProperty({
    description: 'Reading part identifier',
    enum: ['PART_1', 'PART_2', 'PART_3'],
    example: 'PART_1',
  })
  @IsEnum(['PART_1', 'PART_2', 'PART_3'])
  part: string;

  @ApiProperty({
    description: 'Question configuration for this reading part',
    type: CreateQuestionDto,
  })
  @ValidateNested()
  @Type(() => CreateQuestionDto)
  question: CreateQuestionDto;

  @ApiProperty({
    description: 'Reading passage text',
    example:
      'Climate change is one of the most pressing issues of our time. The scientific consensus is clear: human activities, particularly the burning of fossil fuels, are the primary drivers of recent climate change. The effects are already visible in rising global temperatures, melting ice caps, and more frequent extreme weather events...',
  })
  @IsString()
  passage: string;

  @ApiPropertyOptional({
    description: 'Answer key for this reading part',
    example: {
      '1': 'TRUE',
      '2': 'FALSE',
      '3': 'NOT GIVEN',
      '4': 'C',
      '5': 'fossil fuels',
    },
  })
  @IsOptional()
  answers?: Record<string, any>;
}

export class CreateReadingDto {
  @ApiPropertyOptional({
    description: 'Title of the reading test',
    example: 'IELTS Reading Test - Academic Module',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the reading test',
    example:
      'A comprehensive reading test featuring three passages with increasing difficulty levels, covering topics from general interest to academic subjects.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this test is for CDI (Cambridge Development Institute)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the associated IELTS test',
    example: 'uuid-string-test',
  })
  @IsOptional()
  @IsString()
  test_id?: string;

  @ApiProperty({
    description: 'Array of reading parts (1-3)',
    type: [CreateReadingPartDto],
    example: [
      {
        part: 'PART_1',
        question: {
          content: [
            {
              id: 'rp1_001',
              type: 'multiple-choice',
              title: 'Multiple Choice Questions',
              condition: 'Choose the correct letter, A, B, C or D.',
              questions: [
                {
                  id: 1,
                  text: 'What is the main topic of the passage?',
                  type: 'multiple_choice',
                },
              ],
              options: [
                'A) Environmental issues',
                'B) Technology advances',
                'C) Social problems',
                'D) Economic growth',
              ],
            },
          ],
          number_of_questions: 13,
        },
        passage:
          'Climate change represents one of the most significant challenges facing humanity in the 21st century...',
        answers: {
          '1': 'A',
          '2': 'TRUE',
          '3': 'FALSE',
        },
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReadingPartDto)
  parts: CreateReadingPartDto[];
}

export class CreateWritingTaskDto {
  @ApiProperty({
    description: 'Writing task identifier',
    enum: ['TASK_1', 'TASK_2'],
    example: 'TASK_1',
  })
  @IsEnum(['TASK_1', 'TASK_2'])
  task: string;

  @ApiProperty({
    description: 'Type of writing task',
    enum: ['academic_task_1', 'general_task_1', 'task_2'],
    example: 'academic_task_1',
  })
  @IsEnum(['academic_task_1', 'general_task_1', 'task_2'])
  task_type: string;

  @ApiProperty({
    description: 'The writing task prompt/question',
    example:
      'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description:
      'URL to visual content (chart, graph, diagram) for Academic Task 1',
    example: 'https://example.com/images/chart-housing-1918-2011.png',
  })
  @IsOptional()
  @IsString()
  visual_url?: string;

  @ApiPropertyOptional({
    description: 'Minimum word count required',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  min_words?: number;

  @ApiPropertyOptional({
    description: 'Suggested time in minutes',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  time_minutes?: number;

  @ApiPropertyOptional({
    description: 'Sample answer with band score and examiner comments',
    example: {
      text: 'The chart illustrates the changes in housing tenure...',
      band_score: 7.5,
      examiner_comments: 'Good overview with clear comparisons.',
    },
  })
  @IsOptional()
  sample_answer?: {
    text?: string;
    band_score?: number;
    examiner_comments?: string;
  };

  @ApiPropertyOptional({
    description: 'Assessment criteria for this task',
    example: {
      task_achievement: 'Fully addresses all parts of the task',
      coherence_cohesion: 'Logically organized with clear progression',
      lexical_resource: 'Wide range of vocabulary used accurately',
      grammatical_range: 'Wide range of structures with flexibility',
    },
  })
  @IsOptional()
  assessment_criteria?: {
    task_achievement?: string;
    coherence_cohesion?: string;
    lexical_resource?: string;
    grammatical_range?: string;
  };
}

export class CreateWritingDto {
  @ApiPropertyOptional({
    description: 'Title of the writing test',
    example: 'IELTS Writing Test - Academic Module',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the writing test',
    example:
      'A comprehensive writing test with Task 1 (visual description) and Task 2 (essay writing).',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this test is for CDI (Cambridge Development Institute)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  for_cdi?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the associated IELTS test',
    example: 'uuid-string-test',
  })
  @IsOptional()
  @IsString()
  test_id?: string;

  @ApiProperty({
    description: 'Array of writing tasks (1-2)',
    type: [CreateWritingTaskDto],
    example: [
      {
        task: 'TASK_1',
        task_type: 'academic_task_1',
        prompt:
          'The chart shows the percentage of households in owned and rented accommodation...',
        visual_url: 'https://example.com/images/chart.png',
        min_words: 150,
        time_minutes: 20,
      },
      {
        task: 'TASK_2',
        task_type: 'task_2',
        prompt:
          'Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree?',
        min_words: 250,
        time_minutes: 40,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWritingTaskDto)
  tasks: CreateWritingTaskDto[];
}
