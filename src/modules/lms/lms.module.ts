import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LmsController } from './lms.controller';
import { LmsService } from './lms.service';
import {
  Course,
  CourseModule as CourseModuleEntity,
  Lesson,
  Quiz,
  QuizQuestion,
  LessonProgress,
  CourseProgress,
  QuizAttempt,
  Vocabulary,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseModuleEntity,
      Lesson,
      Quiz,
      QuizQuestion,
      LessonProgress,
      CourseProgress,
      QuizAttempt,
      Vocabulary,
    ]),
  ],
  controllers: [LmsController],
  providers: [LmsService],
  exports: [LmsService],
})
export class LmsModule {}
