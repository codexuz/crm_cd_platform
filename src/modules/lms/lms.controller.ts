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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LmsService } from './lms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName } from '../../entities';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
  CreateModuleDto,
  UpdateModuleDto,
  ModuleResponseDto,
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto,
  CreateQuizDto,
  UpdateQuizDto,
  QuizResponseDto,
  QuizQuestionResponseDto,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  SubmitQuizDto,
  MarkLessonCompleteDto,
  LessonProgressResponseDto,
  CourseProgressResponseDto,
  QuizAttemptResponseDto,
  CreateVocabularyDto,
  UpdateVocabularyDto,
  VocabularyResponseDto,
  GenerateVocabularyQuizDto,
} from './dto/index';

@ApiTags('LMS - Learning Management System')
@Controller('centers/:centerId/lms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  // ============ COURSE ENDPOINTS ============
  @Post('courses')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Create a new course (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  async createCourse(
    @Param('centerId') centerId: string,
    @Body() createCourseDto: CreateCourseDto,
    @GetUser('userId') userId: string,
  ): Promise<CourseResponseDto> {
    return await this.lmsService.createCourse(
      centerId,
      createCourseDto,
      userId,
    );
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses for center' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiResponse({
    status: 200,
    description: 'List of all courses for center',
    type: [CourseResponseDto],
  })
  async getAllCourses(
    @Param('centerId') centerId: string,
  ): Promise<CourseResponseDto[]> {
    return await this.lmsService.getAllCourses(centerId);
  }

  @Get('courses/published')
  @ApiOperation({ summary: 'Get all published courses for center' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiResponse({
    status: 200,
    description: 'List of published courses for center',
    type: [CourseResponseDto],
  })
  async getPublishedCourses(
    @Param('centerId') centerId: string,
  ): Promise<CourseResponseDto[]> {
    return await this.lmsService.getPublishedCourses(centerId);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course details',
    type: CourseResponseDto,
  })
  async getCourseById(
    @Param('centerId') centerId: string,
    @Param('courseId') courseId: string,
  ): Promise<CourseResponseDto> {
    return await this.lmsService.getCourseById(centerId, courseId);
  }

  @Put('courses/:courseId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update course (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  async updateCourse(
    @Param('centerId') centerId: string,
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @GetUser('userId') userId: string,
  ): Promise<CourseResponseDto> {
    return await this.lmsService.updateCourse(
      centerId,
      courseId,
      updateCourseDto,
      userId,
    );
  }

  @Delete('courses/:courseId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Delete course (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async deleteCourse(
    @Param('centerId') centerId: string,
    @Param('courseId') courseId: string,
    @GetUser('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.lmsService.deleteCourse(centerId, courseId, userId);
    return { message: 'Course deleted successfully' };
  }

  // ============ MODULE ENDPOINTS ============
  @Post('courses/:courseId/modules')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Create module in course (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 201,
    description: 'Module created successfully',
    type: ModuleResponseDto,
  })
  async createModule(
    @Param('centerId') centerId: string,
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
  ): Promise<ModuleResponseDto> {
    return await this.lmsService.createModule(
      centerId,
      courseId,
      createModuleDto,
    );
  }

  @Get('courses/:courseId/modules')
  @ApiOperation({ summary: 'Get all modules in a course' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'List of modules',
    type: [ModuleResponseDto],
  })
  async getModulesByCourse(
    @Param('centerId') centerId: string,
    @Param('courseId') courseId: string,
  ): Promise<ModuleResponseDto[]> {
    return await this.lmsService.getModulesByCourse(centerId, courseId);
  }

  @Get('modules/:moduleId')
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Module details',
    type: ModuleResponseDto,
  })
  async getModuleById(
    @Param('moduleId') moduleId: string,
  ): Promise<ModuleResponseDto> {
    return await this.lmsService.getModuleById(moduleId);
  }

  @Put('modules/:moduleId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update module (Owner/Teacher only)' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Module updated successfully',
    type: ModuleResponseDto,
  })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return await this.lmsService.updateModule(moduleId, updateModuleDto);
  }

  @Delete('modules/:moduleId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Delete module (Owner/Teacher only)' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  async deleteModule(
    @Param('moduleId') moduleId: string,
  ): Promise<{ message: string }> {
    await this.lmsService.deleteModule(moduleId);
    return { message: 'Module deleted successfully' };
  }

  // ============ LESSON ENDPOINTS ============
  @Post('modules/:moduleId/lessons')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Create lesson in module (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    type: LessonResponseDto,
  })
  async createLesson(
    @Param('centerId') centerId: string,
    @Param('moduleId') moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<LessonResponseDto> {
    return await this.lmsService.createLesson(
      centerId,
      moduleId,
      createLessonDto,
    );
  }

  @Get('modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Get all lessons in a module' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons',
    type: [LessonResponseDto],
  })
  async getLessonsByModule(
    @Param('centerId') centerId: string,
    @Param('moduleId') moduleId: string,
  ): Promise<LessonResponseDto[]> {
    return await this.lmsService.getLessonsByModule(centerId, moduleId);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson details',
    type: LessonResponseDto,
  })
  async getLessonById(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<LessonResponseDto> {
    return await this.lmsService.getLessonById(centerId, lessonId);
  }

  @Put('lessons/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update lesson (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    type: LessonResponseDto,
  })
  async updateLesson(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    return await this.lmsService.updateLesson(
      centerId,
      lessonId,
      updateLessonDto,
    );
  }

  @Delete('lessons/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Delete lesson (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  async deleteLesson(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<{ message: string }> {
    await this.lmsService.deleteLesson(centerId, lessonId);
    return { message: 'Lesson deleted successfully' };
  }

  // ============ QUIZ ENDPOINTS ============
  @Post('lessons/:lessonId/quiz')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Create quiz for lesson (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    type: QuizResponseDto,
  })
  async createQuiz(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<QuizResponseDto> {
    return await this.lmsService.createQuiz(centerId, lessonId, createQuizDto);
  }

  @Get('lessons/:lessonId/quiz')
  @ApiOperation({ summary: 'Get quiz for lesson' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz details',
    type: QuizResponseDto,
  })
  async getQuizByLesson(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return await this.lmsService.getQuizByLesson(centerId, lessonId);
  }

  @Get('quizzes/:quizId')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz details',
    type: QuizResponseDto,
  })
  async getQuizById(@Param('quizId') quizId: string): Promise<QuizResponseDto> {
    return await this.lmsService.getQuizById(quizId);
  }

  @Get('quizzes/:quizId/questions')
  @ApiOperation({ summary: 'Get all questions in a quiz (without answers)' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'List of quiz questions',
    type: [QuizQuestionResponseDto],
  })
  async getQuizQuestions(
    @Param('quizId') quizId: string,
  ): Promise<QuizQuestionResponseDto[]> {
    return await this.lmsService.getQuizQuestions(quizId);
  }

  @Put('quizzes/:quizId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update quiz (Owner/Teacher only)' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz updated successfully',
    type: QuizResponseDto,
  })
  async updateQuiz(
    @Param('quizId') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<QuizResponseDto> {
    return await this.lmsService.updateQuiz(quizId, updateQuizDto);
  }

  @Delete('quizzes/:quizId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Delete quiz (Owner/Teacher only)' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  async deleteQuiz(
    @Param('quizId') quizId: string,
  ): Promise<{ message: string }> {
    await this.lmsService.deleteQuiz(quizId);
    return { message: 'Quiz deleted successfully' };
  }

  // Quiz Questions
  @Post('quizzes/:quizId/questions')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Add question to quiz (Owner/Teacher only)' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({
    status: 201,
    description: 'Question added successfully',
    type: QuizQuestionResponseDto,
  })
  async createQuizQuestion(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuizQuestionResponseDto> {
    return await this.lmsService.createQuizQuestion(quizId, createQuestionDto);
  }

  @Put('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update quiz question (Owner/Teacher only)' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    type: QuizQuestionResponseDto,
  })
  async updateQuizQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuizQuestionDto,
  ): Promise<QuizQuestionResponseDto> {
    return await this.lmsService.updateQuizQuestion(
      questionId,
      updateQuestionDto,
    );
  }

  @Delete('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Delete quiz question (Owner/Teacher only)' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  async deleteQuizQuestion(
    @Param('questionId') questionId: string,
  ): Promise<{ message: string }> {
    await this.lmsService.deleteQuizQuestion(questionId);
    return { message: 'Question deleted successfully' };
  }

  // ============ STUDENT PROGRESS ENDPOINTS ============
  @Post('lessons/:lessonId/complete')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Mark lesson as complete (Student only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson marked as complete',
    type: LessonProgressResponseDto,
  })
  async markLessonComplete(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
    @Body() markCompleteDto: MarkLessonCompleteDto,
    @GetUser('userId') userId: string,
  ): Promise<LessonProgressResponseDto> {
    return await this.lmsService.markLessonComplete(
      userId,
      centerId,
      lessonId,
      markCompleteDto,
    );
  }

  @Get('lessons/:lessonId/progress')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get lesson progress (Student only)' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson progress',
    type: LessonProgressResponseDto,
  })
  async getLessonProgress(
    @Param('lessonId') lessonId: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.lmsService.getLessonProgress(userId, lessonId);
  }

  @Get('courses/:courseId/progress')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get course progress (Student only)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course progress',
    type: CourseProgressResponseDto,
  })
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @GetUser('userId') userId: string,
  ): Promise<CourseProgressResponseDto> {
    return await this.lmsService.getCourseProgress(userId, courseId);
  }

  @Get('my-progress')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({
    summary: 'Get all course progress for current user (Student only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User course progress',
    type: [CourseProgressResponseDto],
  })
  async getUserCourseProgress(
    @GetUser('userId') userId: string,
  ): Promise<CourseProgressResponseDto[]> {
    return await this.lmsService.getUserCourseProgress(userId);
  }

  // ============ QUIZ SUBMISSION ENDPOINTS ============
  @Post('quizzes/:quizId/submit')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Submit quiz answers (Student only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({
    status: 201,
    description: 'Quiz submitted successfully',
    type: QuizAttemptResponseDto,
  })
  async submitQuiz(
    @Param('centerId') centerId: string,
    @Param('quizId') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @GetUser('userId') userId: string,
  ): Promise<QuizAttemptResponseDto> {
    return await this.lmsService.submitQuiz(
      userId,
      centerId,
      quizId,
      submitQuizDto,
    );
  }

  @Get('quizzes/:quizId/attempts')
  @UseGuards(RolesGuard)
  @Roles(RoleName.STUDENT)
  @ApiOperation({ summary: 'Get quiz attempts (Student only)' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz attempts',
    type: [QuizAttemptResponseDto],
  })
  async getQuizAttempts(
    @Param('quizId') quizId: string,
    @GetUser('userId') userId: string,
  ): Promise<QuizAttemptResponseDto[]> {
    return await this.lmsService.getQuizAttempts(userId, quizId);
  }

  // ============ VOCABULARY ENDPOINTS ============
  @Post('lessons/:lessonId/vocabulary')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Add vocabulary to lesson (Owner/Teacher only)' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 201,
    description: 'Vocabulary added successfully',
    type: VocabularyResponseDto,
  })
  async createVocabulary(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
    @Body() createVocabularyDto: CreateVocabularyDto,
  ): Promise<VocabularyResponseDto> {
    return await this.lmsService.createVocabulary(
      centerId,
      lessonId,
      createVocabularyDto,
    );
  }

  @Get('lessons/:lessonId/vocabulary')
  @ApiOperation({ summary: 'Get all vocabulary for a lesson' })
  @ApiParam({ name: 'centerId', description: 'Center ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'List of vocabulary',
    type: [VocabularyResponseDto],
  })
  async getVocabularyByLesson(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<VocabularyResponseDto[]> {
    return await this.lmsService.getVocabularyByLesson(centerId, lessonId);
  }

  @Get('vocabulary/:vocabularyId')
  @ApiOperation({ summary: 'Get vocabulary by ID' })
  @ApiParam({ name: 'vocabularyId', description: 'Vocabulary ID' })
  @ApiResponse({
    status: 200,
    description: 'Vocabulary details',
    type: VocabularyResponseDto,
  })
  async getVocabularyById(
    @Param('vocabularyId') vocabularyId: string,
  ): Promise<VocabularyResponseDto> {
    return await this.lmsService.getVocabularyById(vocabularyId);
  }

  @Put('vocabulary/:vocabularyId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Update vocabulary (Owner/Teacher only)' })
  @ApiParam({ name: 'vocabularyId', description: 'Vocabulary ID' })
  @ApiResponse({
    status: 200,
    description: 'Vocabulary updated successfully',
    type: VocabularyResponseDto,
  })
  async updateVocabulary(
    @Param('vocabularyId') vocabularyId: string,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<VocabularyResponseDto> {
    return await this.lmsService.updateVocabulary(
      vocabularyId,
      updateVocabularyDto,
    );
  }

  @Delete('vocabulary/:vocabularyId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Delete vocabulary (Owner/Teacher only)' })
  @ApiParam({ name: 'vocabularyId', description: 'Vocabulary ID' })
  @ApiResponse({ status: 200, description: 'Vocabulary deleted successfully' })
  async deleteVocabulary(
    @Param('vocabularyId') vocabularyId: string,
  ): Promise<{ message: string }> {
    await this.lmsService.deleteVocabulary(vocabularyId);
    return { message: 'Vocabulary deleted successfully' };
  }

  // ============ VOCABULARY QUIZ GENERATION ============
  @Post('lessons/:lessonId/quiz/generate-vocabulary')
  @UseGuards(RolesGuard)
  @Roles(RoleName.OWNER, RoleName.TEACHER)
  @ApiOperation({
    summary:
      'Auto-generate vocabulary quiz from lesson vocabulary (Owner/Teacher only)',
  })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 201,
    description: 'Vocabulary quiz generated successfully',
    type: QuizResponseDto,
  })
  async generateVocabularyQuiz(
    @Param('centerId') centerId: string,
    @Param('lessonId') lessonId: string,
    @Body() generateDto: GenerateVocabularyQuizDto,
  ): Promise<QuizResponseDto> {
    return await this.lmsService.generateVocabularyQuiz(
      centerId,
      lessonId,
      generateDto,
    );
  }
}
