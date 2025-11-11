import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IeltsController } from './ielts.controller';
import { IeltsService } from './ielts.service';
import { TestAssignmentController } from './test-assignment.controller';
import { TestAssignmentService } from './test-assignment.service';
import { StudentDashboardController } from './student-dashboard.controller';
import { StudentDashboardService } from './student-dashboard.service';
import {
  IeltsTest,
  IeltsListening,
  IeltsListeningPart,
  IeltsReading,
  IeltsReadingPart,
  IeltsQuestion,
  IeltsAudio,
  TestAssignment,
  TestResult,
  User,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IeltsTest,
      IeltsListening,
      IeltsListeningPart,
      IeltsReading,
      IeltsReadingPart,
      IeltsQuestion,
      IeltsAudio,
      TestAssignment,
      TestResult,
      User,
    ]),
  ],
  controllers: [
    IeltsController, 
    TestAssignmentController, 
    StudentDashboardController
  ],
  providers: [
    IeltsService, 
    TestAssignmentService, 
    StudentDashboardService
  ],
  exports: [
    IeltsService, 
    TestAssignmentService, 
    StudentDashboardService
  ],
})
export class IeltsModule {}
