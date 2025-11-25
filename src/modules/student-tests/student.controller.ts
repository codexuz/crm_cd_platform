import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { StudentTestsService } from './student-tests.service';
import { IeltsService } from '../ielts/ielts.service';
import { StudentAuthGuard } from '../../common/guards/student-auth.guard';
import { GetStudent } from '../../common/decorators/get-student.decorator';
import {
  SubmitTestResultDto,
  SaveSectionProgressDto,
  TestContentResponse,
} from './dto/student-test.dto';

@ApiTags('Student Tests')
@ApiBearerAuth('student-jwt')
@Controller('student')
@UseGuards(StudentAuthGuard)
export class StudentController {
  constructor(
    private readonly studentTestsService: StudentTestsService,
    private readonly ieltsService: IeltsService,
  ) {}

  // Get student's assignment details
  @Get('assignment')
  @ApiOperation({
    summary: 'Get student assignment details',
    description:
      'Retrieves the current test assignment details for the authenticated student',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No assignment found for this candidate ID',
  })
  async getMyAssignment(@GetStudent('candidateId') candidateId: string) {
    return await this.studentTestsService.getStudentAssignment(candidateId);
  }

  // Start the test (changes status to in_progress)
  @Post('start-test')
  @ApiOperation({
    summary: 'Start the assigned test',
    description:
      'Changes the test status to in_progress, allowing the student to begin taking the test',
  })
  @ApiResponse({
    status: 200,
    description: 'Test started successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Test already completed or expired',
  })
  async startTest(@GetStudent('candidateId') candidateId: string) {
    return await this.studentTestsService.startTest(candidateId);
  }

  // Get test content (IELTS test details)
  @Get('test-content')
  @ApiOperation({
    summary: 'Get test content and details',
    description:
      'Retrieves the IELTS test content, schedule, and student information',
  })
  @ApiResponse({
    status: 200,
    description: 'Test content retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Test has expired or already completed',
  })
  async getTestContent(
    @GetStudent('candidateId') candidateId: string,
  ): Promise<TestContentResponse> {
    return await this.studentTestsService.getTestContent(candidateId);
  }

  // Get listening section
  @Get('listening')
  @ApiOperation({
    summary: 'Get listening section content',
    description:
      'Retrieves the listening section content for the assigned test',
  })
  @ApiResponse({
    status: 200,
    description: 'Listening section retrieved successfully',
  })
  async getListening(
    @GetStudent('testId') testId: string,
    @GetStudent('centerId') centerId: string,
  ) {
    return await this.ieltsService.getListeningByTestId(testId, centerId);
  }

  // Get reading section
  @Get('reading')
  @ApiOperation({
    summary: 'Get reading section content',
    description: 'Retrieves the reading section content for the assigned test',
  })
  @ApiResponse({
    status: 200,
    description: 'Reading section retrieved successfully',
  })
  async getReading(
    @GetStudent('testId') testId: string,
    @GetStudent('centerId') centerId: string,
  ) {
    return await this.ieltsService.getReadingByTestId(testId, centerId);
  }

  // Get writing section
  @Get('writing')
  @ApiOperation({
    summary: 'Get writing section content',
    description: 'Retrieves the writing section content for the assigned test',
  })
  @ApiResponse({
    status: 200,
    description: 'Writing section retrieved successfully',
  })
  async getWriting(
    @GetStudent('testId') testId: string,
    @GetStudent('centerId') centerId: string,
  ) {
    return await this.ieltsService.getWritingByTestId(testId, centerId);
  }

  // Submit test results
  @Post('submit-test')
  @ApiOperation({
    summary: 'Submit complete test results',
    description:
      'Submits the final test results for all sections (listening, reading, writing)',
  })
  @ApiBody({ type: SubmitTestResultDto })
  @ApiResponse({
    status: 200,
    description: 'Test results submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Test already completed, expired, or invalid data',
  })
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

  // Save section progress (multiple answers)
  @Post('save-section-progress')
  @ApiOperation({
    summary: 'Save section progress',
    description:
      'Saves progress for an entire section including multiple answers and time tracking',
  })
  @ApiBody({ type: SaveSectionProgressDto })
  @ApiResponse({
    status: 200,
    description: 'Section progress saved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'listening progress saved successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Test is no longer active or invalid data',
  })
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
