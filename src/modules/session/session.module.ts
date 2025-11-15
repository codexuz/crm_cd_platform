import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Session, TokenBlacklist } from '../../entities';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, TokenBlacklist]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
