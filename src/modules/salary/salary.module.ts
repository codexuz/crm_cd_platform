import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherSalary, User } from '../../entities';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherSalary, User])],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}