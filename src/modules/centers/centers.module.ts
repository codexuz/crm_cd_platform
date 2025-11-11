import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Center, 
  User, 
  Role, 
  TestAssignment, 
  TestResult 
} from '../../entities';
import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';
import { CenterManagementService } from './center-management.service';
import { CenterManagementController } from './center-management.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Center, 
      User, 
      Role, 
      TestAssignment, 
      TestResult
    ])
  ],
  controllers: [
    CentersController, 
    CenterManagementController
  ],
  providers: [
    CentersService, 
    CenterManagementService
  ],
  exports: [
    CentersService, 
    CenterManagementService
  ],
})
export class CentersModule {}