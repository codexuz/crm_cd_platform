import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StudentTestsService } from './student-tests.service';
import { IeltsService } from '../ielts/ielts.service';
import { StudentAuthGuard } from '../../common/guards/student-auth.guard';
import { GetStudent } from '../../common/decorators/get-student.decorator';
import { SubmitTestResultDto } from './dto/student-test.dto';

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
  async getTestContent(@GetStudent('candidateId') candidateId: string) {
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
    return await this.studentTestsService.submitTestResults(
      candidateId,
      submitDto.test_results,
    );
  }
}
