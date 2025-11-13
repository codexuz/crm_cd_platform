import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Role, Center } from '../../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GoogleStudentStrategy } from './google-student.strategy';
import { GoogleTeacherStrategy } from './google-teacher.strategy';
import { GoogleOwnerStrategy } from './google-owner.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Center]),
    PassportModule,
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
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    GoogleStudentStrategy,
    GoogleTeacherStrategy,
    GoogleOwnerStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
