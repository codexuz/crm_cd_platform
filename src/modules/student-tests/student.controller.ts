import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StudentTestsService } from './student-tests.service';
import { IeltsService } from '../ielts/ielts.service';
import { StudentAuthGuard } from '../../common/guards/student-auth.guard';
import { GetStudent } from '../../common/decorators/get-student.decorator';
import { SubmitTestResultDto } from './dto/student-test.dto';
import {
  SaveListeningAnswerDto,
  SaveReadingAnswerDto,
  SaveWritingTaskDto,
  SaveSectionProgressDto,
  TestContentResponse,
} from './dto/student-test.dto';

@Controller('student')
@UseGuards(StudentAuthGuard)
export class StudentController {
  constructor(
    private readonly studentTestsService: StudentTestsService,
    private readonly ieltsService: IeltsService,
  ) {}

  // Get student's assignment details
  @Get('assignment')
  async getMyAssignment(@GetStudent('candidateId') candidateId: string) {
    return await this.studentTestsService.getStudentAssignment(candidateId);
  }

  // Start the test (changes status to in_progress)
  @Post('start-test')
  async startTest(@GetStudent('candidateId') candidateId: string) {
    return await this.studentTestsService.startTest(candidateId);
  }

  // Get test content (IELTS test details)
  @Get('test-content')
  async getTestContent(
    @GetStudent('candidateId') candidateId: string,
  ): Promise<TestContentResponse> {
    return await this.studentTestsService.getTestContent(candidateId);
  }

  // Get listening section
  @Get('listening')
  async getListening(
    @GetStudent('testId') testId: string,
    @GetStudent('centerId') centerId: string,
  ) {
    return await this.ieltsService.getListeningByTestId(testId, centerId);
  }

  // Get reading section
  @Get('reading')
  async getReading(
    @GetStudent('testId') testId: string,
    @GetStudent('centerId') centerId: string,
  ) {
    return await this.ieltsService.getReadingByTestId(testId, centerId);
  }

  // Get writing section
  @Get('writing')
  async getWriting(
    @GetStudent('testId') testId: string,
    @GetStudent('centerId') centerId: string,
  ) {
    return await this.ieltsService.getWritingByTestId(testId, centerId);
  }

  // Submit test results
  @Post('submit-test')
  async submitTest(
    @GetStudent('candidateId') candidateId: string,
    @Body() submitDto: SubmitTestResultDto,
  ) {
    if (!submitDto.test_results) {
      throw new Error('Test results are required');
    }
    return await this.studentTestsService.submitTestResults(
      candidateId,
      submitDto.test_results,
    );
  }

  // Save individual listening answer
  @Post('save-listening-answer')
  async saveListeningAnswer(
    @GetStudent('candidateId') candidateId: string,
    @Body() saveDto: SaveListeningAnswerDto,
  ) {
    return await this.studentTestsService.saveListeningAnswer(
      candidateId,
      saveDto,
    );
  }

  // Save individual reading answer
  @Post('save-reading-answer')
  async saveReadingAnswer(
    @GetStudent('candidateId') candidateId: string,
    @Body() saveDto: SaveReadingAnswerDto,
  ) {
    return await this.studentTestsService.saveReadingAnswer(
      candidateId,
      saveDto,
    );
  }

  // Save writing task
  @Post('save-writing-task')
  async saveWritingTask(
    @GetStudent('candidateId') candidateId: string,
    @Body() saveDto: SaveWritingTaskDto,
  ) {
    return await this.studentTestsService.saveWritingTask(candidateId, saveDto);
  }

  // Save section progress (multiple answers)
  @Post('save-section-progress')
  async saveSectionProgress(
    @GetStudent('candidateId') candidateId: string,
    @Body() saveDto: SaveSectionProgressDto,
  ) {
    return await this.studentTestsService.saveSectionProgress(
      candidateId,
      saveDto,
    );
  }
}
