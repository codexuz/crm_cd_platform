import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
  QuizType,
  QuizQuestionType,
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
  GenerateVocabularyQuizDto,
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
    moduleId: string,
    createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    await this.getModuleById(moduleId);

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      module_id: moduleId,
    });
    return await this.lessonRepository.save(lesson);
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    await this.getModuleById(moduleId);

    return await this.lessonRepository.find({
      where: { module_id: moduleId },
      order: { order: 'ASC' },
    });
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return lesson;
  }

  async updateLesson(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    const lesson = await this.getLessonById(lessonId);
    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const lesson = await this.getLessonById(lessonId);
    await this.lessonRepository.remove(lesson);
  }

  // ============ QUIZ CRUD ============
  async createQuiz(
    lessonId: string,
    createQuizDto: CreateQuizDto,
  ): Promise<Quiz> {
    await this.getLessonById(lessonId);

    const quiz = this.quizRepository.create({
      title: createQuizDto.title,
      quiz_type: (createQuizDto.quiz_type as QuizType) ?? QuizType.GENERAL,
      vocabulary_based: (createQuizDto.vocabulary_based as boolean) ?? false,
      time_limit: createQuizDto.time_limit,
      lesson_id: lessonId,
    });
    const savedQuiz = await this.quizRepository.save(quiz);

    // Create questions
    for (const questionDto of createQuizDto.questions) {
      const question = this.quizQuestionRepository.create({
        ...questionDto,
        quiz_id: savedQuiz.id,
      });
      await this.quizQuestionRepository.save(question);
    }

    return savedQuiz;
  }

  async getQuizByLesson(lessonId: string): Promise<Quiz | null> {
    await this.getLessonById(lessonId);

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
    lessonId: string,
    markCompleteDto: MarkLessonCompleteDto,
  ): Promise<LessonProgress> {
    await this.getLessonById(lessonId);

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
    const lesson = await this.getLessonById(lessonId);
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
      await this.markLessonComplete(userId, quiz.lesson_id, {
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
    lessonId: string,
    createVocabularyDto: CreateVocabularyDto,
  ): Promise<Vocabulary> {
    await this.getLessonById(lessonId);

    const vocabulary = this.vocabularyRepository.create({
      ...createVocabularyDto,
      lesson_id: lessonId,
    });
    return await this.vocabularyRepository.save(vocabulary);
  }

  async getVocabularyByLesson(lessonId: string): Promise<Vocabulary[]> {
    await this.getLessonById(lessonId);

    return await this.vocabularyRepository.find({
      where: { lesson_id: lessonId },
      order: { order: 'ASC' },
    });
  }

  async getVocabularyById(vocabularyId: string): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id: vocabularyId },
    });

    if (!vocabulary) {
      throw new NotFoundException(
        `Vocabulary with ID ${vocabularyId} not found`,
      );
    }

    return vocabulary;
  }

  async updateVocabulary(
    vocabularyId: string,
    updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<Vocabulary> {
    const vocabulary = await this.getVocabularyById(vocabularyId);
    Object.assign(vocabulary, updateVocabularyDto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async deleteVocabulary(vocabularyId: string): Promise<void> {
    const vocabulary = await this.getVocabularyById(vocabularyId);
    await this.vocabularyRepository.remove(vocabulary);
  }

  // ============ VOCABULARY QUIZ GENERATION ============
  async generateVocabularyQuiz(
    lessonId: string,
    generateDto: GenerateVocabularyQuizDto,
  ): Promise<Quiz> {
    await this.getLessonById(lessonId);

    // Get all vocabulary for this lesson
    const vocabularyList = await this.getVocabularyByLesson(lessonId);

    if (vocabularyList.length === 0) {
      throw new BadRequestException(
        'No vocabulary found for this lesson to generate a quiz',
      );
    }

    const title = generateDto.title ?? 'Vocabulary Quiz';
    const timeLimit = generateDto.time_limit;
    const questionTypes = generateDto.question_types ?? [
      QuizQuestionType.VOCABULARY_TRANSLATION,
      QuizQuestionType.VOCABULARY_DEFINITION,
    ];
    const questionsPerWord = generateDto.questions_per_word ?? 1;

    // Create quiz
    const quiz = this.quizRepository.create({
      title,
      quiz_type: QuizType.VOCABULARY,
      vocabulary_based: true,
      time_limit: timeLimit,
      lesson_id: lessonId,
    });
    const savedQuiz = await this.quizRepository.save(quiz);

    let order = 1;

    // Generate questions for each vocabulary word
    for (const vocab of vocabularyList) {
      for (let i = 0; i < questionsPerWord; i++) {
        const questionType =
          questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let question: string;
        let correctAnswer: string;
        let options: string[] | undefined;

        switch (questionType) {
          case QuizQuestionType.VOCABULARY_TRANSLATION: {
            // Ask for Uzbek or Russian translation
            const targetLang = Math.random() > 0.5 ? 'uz' : 'ru';
            question = `What is the ${targetLang === 'uz' ? 'Uzbek' : 'Russian'} translation of "${vocab.word}"?`;
            correctAnswer = targetLang === 'uz' ? vocab.uz : vocab.ru;

            // Generate wrong options from other vocabulary
            options = this.generateWrongOptions(
              vocabularyList,
              correctAnswer,
              targetLang,
              3,
            );
            options.push(correctAnswer);
            options = this.shuffleArray(options);
            break;
          }

          case QuizQuestionType.VOCABULARY_DEFINITION: {
            // Give translation, ask for English word
            const fromLang = Math.random() > 0.5 ? 'uz' : 'ru';
            const translation = fromLang === 'uz' ? vocab.uz : vocab.ru;
            question = `What is the English word for "${translation}"?`;
            correctAnswer = vocab.word;

            // Generate wrong options
            options = this.generateWrongOptions(
              vocabularyList,
              correctAnswer,
              'word',
              3,
            );
            options.push(correctAnswer);
            options = this.shuffleArray(options);
            break;
          }

          case QuizQuestionType.GAP_FILL: {
            // Use example sentence with gap
            if (vocab.example) {
              question = vocab.example.replace(
                new RegExp(vocab.word, 'gi'),
                '____',
              );
              correctAnswer = vocab.word;
            } else {
              // Fallback to translation if no example
              question = `Translate: ${vocab.uz}`;
              correctAnswer = vocab.word;
            }
            break;
          }

          default:
            question = `What is the meaning of "${vocab.word}"?`;
            correctAnswer = vocab.uz;
        }

        const quizQuestion = this.quizQuestionRepository.create({
          quiz_id: savedQuiz.id,
          vocabulary_id: vocab.id,
          question,
          type: questionType,
          options: options || null,
          correct_answer: correctAnswer,
          order: order++,
        });

        await this.quizQuestionRepository.save(quizQuestion);
      }
    }

    return savedQuiz;
  }

  private generateWrongOptions(
    vocabularyList: Vocabulary[],
    correctAnswer: string,
    field: 'uz' | 'ru' | 'word',
    count: number,
  ): string[] {
    const wrongOptions: string[] = [];
    const shuffled = [...vocabularyList].sort(() => Math.random() - 0.5);

    for (const vocab of shuffled) {
      if (wrongOptions.length >= count) break;
      const value = vocab[field];
      if (value && value !== correctAnswer) {
        wrongOptions.push(value);
      }
    }

    // If not enough wrong options, add generic ones
    while (wrongOptions.length < count) {
      wrongOptions.push(`Option ${wrongOptions.length + 1}`);
    }

    return wrongOptions;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
