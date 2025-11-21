import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentTestsController } from './student-tests.controller';
import { StudentController } from './student.controller';
import { StudentTestsService } from './student-tests.service';
import { StudentAssignedTest } from '../../entities/student-assigned-test.entity';
import { IeltsTest } from '../../entities/ielts-test.entity';
import { Subscription } from '../../entities/subscription.entity';
import { IeltsModule } from '../ielts/ielts.module';
import { EmailModule } from '../email/email.module';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentAssignedTest,
      IeltsTest,
      Subscription,
      User,
    ]),
    IeltsModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StudentTestsController, StudentController],
  providers: [StudentTestsService],
  exports: [StudentTestsService],
})
export class StudentTestsModule {}
