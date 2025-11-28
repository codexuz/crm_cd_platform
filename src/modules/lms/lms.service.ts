import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Course,
  CourseModule,
  Lesson,
  Quiz,
  QuizQuestion,
  LessonProgress,
  CourseProgress,
  QuizAttempt,
  CourseStatus,
  Vocabulary,
} from '../../entities';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  SubmitQuizDto,
  MarkLessonCompleteDto,
  CreateVocabularyDto,
  UpdateVocabularyDto,
} from './dto/index';

@Injectable()
export class LmsService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseModule)
    private moduleRepository: Repository<CourseModule>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(CourseProgress)
    private courseProgressRepository: Repository<CourseProgress>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
  ) {}

  // ============ COURSE CRUD ============
  async createCourse(
    centerId: string,
    createCourseDto: CreateCourseDto,
    userId: string,
  ): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      created_by: userId,
      center_id: centerId,
    });
    return await this.courseRepository.save(course);
  }

  async getAllCourses(centerId: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { center_id: centerId },
      order: { created_at: 'DESC' },
    });
  }

  async getPublishedCourses(centerId: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { status: CourseStatus.PUBLISHED, center_id: centerId },
      order: { created_at: 'DESC' },
    });
  }

  async getCourseById(centerId: string, courseId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, center_id: centerId },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in center ${centerId}`,
      );
    }

    return course;
  }

  async updateCourse(
    centerId: string,
    courseId: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
  ): Promise<Course> {
    const course = await this.getCourseById(centerId, courseId);

    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async deleteCourse(
    centerId: string,
    courseId: string,
    userId: string,
  ): Promise<void> {
    const course = await this.getCourseById(centerId, courseId);

    if (course.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.courseRepository.remove(course);
  }

  // ============ MODULE CRUD ============
  async createModule(
    centerId: string,
    courseId: string,
    createModuleDto: CreateModuleDto,
  ): Promise<CourseModule> {
    await this.getCourseById(centerId, courseId);

    const module = this.moduleRepository.create({
      ...createModuleDto,
      course_id: courseId,
      center_id: centerId,
    });
    return await this.moduleRepository.save(module);
  }

  async getModulesByCourse(
    centerId: string,
    courseId: string,
  ): Promise<CourseModule[]> {
    await this.getCourseById(centerId, courseId);

    return await this.moduleRepository.find({
      where: { course_id: courseId, center_id: centerId },
      order: { order: 'ASC' },
    });
  }

  async getModuleById(moduleId: string): Promise<CourseModule> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    return module;
  }

  async updateModule(
    moduleId: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<CourseModule> {
    const module = await this.getModuleById(moduleId);
    Object.assign(module, updateModuleDto);
    return await this.moduleRepository.save(module);
  }

  async deleteModule(moduleId: string): Promise<void> {
    const module = await this.getModuleById(moduleId);
    await this.moduleRepository.remove(module);
  }

  // ============ LESSON CRUD ============
  async createLesson(
    centerId: string,
    moduleId: string,
    createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    await this.getModuleById(moduleId);

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      module_id: moduleId,
      center_id: centerId,
    });
    return await this.lessonRepository.save(lesson);
  }

  async getLessonsByModule(
    centerId: string,
    moduleId: string,
  ): Promise<Lesson[]> {
    await this.getModuleById(moduleId);

    return await this.lessonRepository.find({
      where: { module_id: moduleId, center_id: centerId },
      order: { order: 'ASC' },
    });
  }

  async getLessonById(centerId: string, lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId, center_id: centerId },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson with ID ${lessonId} not found in center ${centerId}`,
      );
    }

    return lesson;
  }

  async updateLesson(
    centerId: string,
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    const lesson = await this.getLessonById(centerId, lessonId);
    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(centerId: string, lessonId: string): Promise<void> {
    const lesson = await this.getLessonById(centerId, lessonId);
    await this.lessonRepository.remove(lesson);
  }

  // ============ QUIZ CRUD ============
  async createQuiz(
    centerId: string,
    lessonId: string,
    createQuizDto: CreateQuizDto,
  ): Promise<Quiz> {
    await this.getLessonById(centerId, lessonId);

    const quiz = this.quizRepository.create({
      title: createQuizDto.title,
      description: createQuizDto.description,
      time_limit: createQuizDto.time_limit,
      lesson_id: lessonId,
      center_id: centerId,
    });
    const savedQuiz = await this.quizRepository.save(quiz);

    // Create questions
    for (const questionDto of createQuizDto.questions) {
      const question = this.quizQuestionRepository.create({
        ...questionDto,
        quiz_id: savedQuiz.id,
        center_id: centerId,
        points: questionDto.points ?? 1,
      });
      await this.quizQuestionRepository.save(question);
    }

    return savedQuiz;
  }

  async getQuizByLesson(
    centerId: string,
    lessonId: string,
  ): Promise<Quiz | null> {
    await this.getLessonById(centerId, lessonId);

    return await this.quizRepository.findOne({
      where: { lesson_id: lessonId },
    });
  }

  async getQuizById(quizId: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    return quiz;
  }

  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    await this.getQuizById(quizId);

    return await this.quizQuestionRepository.find({
      where: { quiz_id: quizId },
      order: { order: 'ASC' },
    });
  }

  async updateQuiz(
    quizId: string,
    updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    const quiz = await this.getQuizById(quizId);
    Object.assign(quiz, updateQuizDto);
    return await this.quizRepository.save(quiz);
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quiz = await this.getQuizById(quizId);
    await this.quizRepository.remove(quiz);
  }

  // Quiz Question CRUD
  async createQuizQuestion(
    quizId: string,
    createQuestionDto: CreateQuizQuestionDto,
  ): Promise<QuizQuestion> {
    await this.getQuizById(quizId);

    const question = this.quizQuestionRepository.create({
      ...createQuestionDto,
      quiz_id: quizId,
    });
    return await this.quizQuestionRepository.save(question);
  }

  async updateQuizQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuizQuestionDto,
  ): Promise<QuizQuestion> {
    const question = await this.quizQuestionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    Object.assign(question, updateQuestionDto);
    return await this.quizQuestionRepository.save(question);
  }

  async deleteQuizQuestion(questionId: string): Promise<void> {
    const question = await this.quizQuestionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    await this.quizQuestionRepository.remove(question);
  }

  // ============ STUDENT PROGRESS ============
  async markLessonComplete(
    userId: string,
    centerId: string,
    lessonId: string,
    markCompleteDto: MarkLessonCompleteDto,
  ): Promise<LessonProgress> {
    await this.getLessonById(centerId, lessonId);

    let progress = await this.lessonProgressRepository.findOne({
      where: { user_id: userId, lesson_id: lessonId },
    });

    if (!progress) {
      progress = this.lessonProgressRepository.create({
        user_id: userId,
        lesson_id: lessonId,
        is_completed: markCompleteDto.is_completed ?? true,
        completed_at:
          markCompleteDto.is_completed !== false ? new Date() : undefined,
      });
    } else {
      progress.is_completed = markCompleteDto.is_completed ?? true;
      if (markCompleteDto.is_completed !== false) {
        progress.completed_at = new Date();
      }
    }

    const savedProgress = await this.lessonProgressRepository.save(progress);

    // Update course progress
    const lesson = await this.getLessonById(centerId, lessonId);
    const module = await this.getModuleById(lesson.module_id);
    await this.updateCourseProgress(userId, module.course_id);

    return savedProgress;
  }

  async getLessonProgress(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress | null> {
    return await this.lessonProgressRepository.findOne({
      where: { user_id: userId, lesson_id: lessonId },
    });
  }

  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgress> {
    let progress = await this.courseProgressRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!progress) {
      progress = this.courseProgressRepository.create({
        user_id: userId,
        course_id: courseId,
        percentage: 0,
      });
      await this.courseProgressRepository.save(progress);
    }

    return progress;
  }

  private async updateCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<void> {
    // Get all modules in the course
    const modules = await this.moduleRepository.find({
      where: { course_id: courseId },
    });

    if (modules.length === 0) return;

    // Get all lessons in all modules
    const moduleIds = modules.map((m) => m.id);
    const allLessons = await this.lessonRepository
      .createQueryBuilder('lesson')
      .where('lesson.module_id IN (:...moduleIds)', { moduleIds })
      .getMany();

    const totalLessons = allLessons.length;
    if (totalLessons === 0) return;

    // Get completed lessons
    const lessonIds = allLessons.map((l) => l.id);
    const completedLessons = await this.lessonProgressRepository
      .createQueryBuilder('progress')
      .where('progress.user_id = :userId', { userId })
      .andWhere('progress.lesson_id IN (:...lessonIds)', { lessonIds })
      .andWhere('progress.is_completed = :completed', { completed: true })
      .getCount();

    const percentage = Math.round((completedLessons / totalLessons) * 100);

    let progress = await this.courseProgressRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!progress) {
      progress = this.courseProgressRepository.create({
        user_id: userId,
        course_id: courseId,
        percentage,
      });
    } else {
      progress.percentage = percentage;
    }

    await this.courseProgressRepository.save(progress);
  }

  // ============ QUIZ SUBMISSION ============
  async submitQuiz(
    userId: string,
    centerId: string,
    quizId: string,
    submitQuizDto: SubmitQuizDto,
  ): Promise<QuizAttempt> {
    const quiz = await this.getQuizById(quizId);
    const questions = await this.getQuizQuestions(quizId);

    // Calculate score
    let correctCount = 0;
    const totalQuestions = questions.length;

    for (const answer of submitQuizDto.answers) {
      const question = questions.find((q) => q.id === answer.question_id);
      if (!question) continue;

      const isCorrect = this.checkAnswer(
        answer.answer,
        question.correct_answer,
      );
      if (isCorrect) correctCount++;
    }

    // Determine if passed (70% threshold)
    const isPassed = correctCount / totalQuestions >= 0.7;

    // Get attempt number
    const previousAttempts = await this.quizAttemptRepository.count({
      where: { user_id: userId, quiz_id: quizId },
    });

    const attempt = this.quizAttemptRepository.create({
      user_id: userId,
      quiz_id: quizId,
      score: correctCount,
      total: totalQuestions,
      is_passed: isPassed,
      attempt_number: previousAttempts + 1,
      submitted_at: new Date(),
    });

    const savedAttempt = await this.quizAttemptRepository.save(attempt);

    // If passed, mark lesson as complete
    if (isPassed) {
      await this.markLessonComplete(userId, centerId, quiz.lesson_id, {
        is_completed: true,
      });
    }

    return savedAttempt;
  }

  private checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    const normalize = (val: any): string => {
      return String(val).toLowerCase().trim();
    };

    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(userAnswer)) {
        return (
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((ans) =>
            correctAnswer.some(
              (correct) => normalize(ans) === normalize(correct),
            ),
          )
        );
      }
      return correctAnswer.some(
        (correct) => normalize(userAnswer) === normalize(correct),
      );
    }

    return normalize(userAnswer) === normalize(correctAnswer);
  }

  async getQuizAttempts(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    return await this.quizAttemptRepository.find({
      where: { user_id: userId, quiz_id: quizId },
      order: { submitted_at: 'DESC' },
    });
  }

  async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    return await this.courseProgressRepository.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
    });
  }

  // ============ VOCABULARY CRUD ============
  async createVocabulary(
    centerId: string,
    lessonId: string,
    createVocabularyDto: CreateVocabularyDto,
  ): Promise<Vocabulary> {
    // Verify lesson exists and belongs to center
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module', 'module.course'],
    });

    if (!lesson || lesson.module.course.center_id !== centerId) {
      throw new NotFoundException(
        `Lesson with ID ${lessonId} not found in center ${centerId}`,
      );
    }

    const vocabulary = this.vocabularyRepository.create({
      ...createVocabularyDto,
      lesson_id: lessonId,
      center_id: centerId,
    });

    return await this.vocabularyRepository.save(vocabulary);
  }

  async getVocabulariesByLesson(
    centerId: string,
    lessonId: string,
  ): Promise<Vocabulary[]> {
    // Verify lesson exists and belongs to center
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['module', 'module.course'],
    });

    if (!lesson || lesson.module.course.center_id !== centerId) {
      throw new NotFoundException(
        `Lesson with ID ${lessonId} not found in center ${centerId}`,
      );
    }

    return await this.vocabularyRepository.find({
      where: { lesson_id: lessonId, center_id: centerId },
      order: { order: 'ASC' },
    });
  }

  async getVocabularyById(
    centerId: string,
    vocabularyId: string,
  ): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id: vocabularyId, center_id: centerId },
      relations: ['lesson'],
    });

    if (!vocabulary) {
      throw new NotFoundException(
        `Vocabulary with ID ${vocabularyId} not found in center ${centerId}`,
      );
    }

    return vocabulary;
  }

  async updateVocabulary(
    centerId: string,
    vocabularyId: string,
    updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<Vocabulary> {
    const vocabulary = await this.getVocabularyById(centerId, vocabularyId);

    Object.assign(vocabulary, updateVocabularyDto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async deleteVocabulary(
    centerId: string,
    vocabularyId: string,
  ): Promise<void> {
    const vocabulary = await this.getVocabularyById(centerId, vocabularyId);
    await this.vocabularyRepository.remove(vocabulary);
  }
}
