import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { CentersModule } from './modules/centers/centers.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SalaryModule } from './modules/salary/salary.module';
import { HealthModule } from './health/health.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { Center } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Center]), // For TenantMiddleware
    AuthModule,
    CentersModule,
    UsersModule,
    LeadsModule,
    GroupsModule,
    PaymentsModule,
    SalaryModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
