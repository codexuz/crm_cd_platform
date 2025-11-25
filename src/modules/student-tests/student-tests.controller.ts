import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StudentTestsService } from './student-tests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { RequiresModules } from '../../common/decorators/subscription.decorator';

import {
  AssignTestToStudentDto,
  UpdateAssignedTestDto,
} from './dto/student-test.dto';

@Controller('student-tests')
@UseGuards(JwtAuthGuard, SubscriptionGuard, ModuleAccessGuard)
@RequiresModules('ielts')
export class StudentTestsController {
  constructor(private readonly studentTestsService: StudentTestsService) {}

  // Teacher endpoints - assign and manage tests
  @Post('centers/:centerId/assign')
  async assignTest(
    @Param('centerId') centerId: string,
    @Body() assignDto: AssignTestToStudentDto,
  ) {
    return await this.studentTestsService.assignTestToStudent(
      assignDto,
      assignDto.assigned_by,
      centerId,
    );
  }

  @Get('centers/:centerId/assignments')
  async getAllAssignments(@Param('centerId') centerId: string) {
    return await this.studentTestsService.getAssignedTestsByCenter(centerId);
  }

  @Get('centers/:centerId/assignments/:id')
  async getAssignmentById(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    return await this.studentTestsService.getAssignedTestById(id, centerId);
  }

  @Put('centers/:centerId/assignments/:id')
  async updateAssignment(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateAssignedTestDto,
  ) {
    return await this.studentTestsService.updateAssignedTest(
      id,
      updateDto,
      centerId,
    );
  }

  @Delete('centers/:centerId/assignments/:id')
  async deleteAssignment(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    await this.studentTestsService.deleteAssignedTest(id, centerId);
    return { message: 'Assignment deleted successfully' };
  }

  // Teacher grading endpoints
  @Post('centers/:centerId/check-listening/:candidateId')
  async checkListening(
    @Param('centerId') centerId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return await this.studentTestsService.checkListeningAnswers(candidateId);
  }

  @Post('centers/:centerId/check-reading/:candidateId')
  async checkReading(
    @Param('centerId') centerId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return await this.studentTestsService.checkReadingAnswers(candidateId);
  }

  @Post('centers/:centerId/check-writing/:candidateId')
  async checkWriting(
    @Param('centerId') centerId: string,
    @Param('candidateId') candidateId: string,
    @Body()
    gradeDto: {
      task1Score?: number;
      task2Score?: number;
      feedback?: string;
    },
  ) {
    return await this.studentTestsService.checkWritingAnswers(
      candidateId,
      gradeDto.task1Score,
      gradeDto.task2Score,
      gradeDto.feedback,
    );
  }

  @Post('centers/:centerId/auto-grade/:candidateId')
  async autoGrade(
    @Param('centerId') centerId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return await this.studentTestsService.autoGradeTest(candidateId);
  }

  @Post('centers/:centerId/send-results/:candidateId')
  async sendResults(
    @Param('centerId') centerId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return await this.studentTestsService.sendTestResultsEmail(candidateId);
  }
}
