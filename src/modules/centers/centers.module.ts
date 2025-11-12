import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Center, 
  User, 
  Role, 
} from '../../entities';
import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Center, 
      User, 
      Role, 
    ])
  ],
  controllers: [
    CentersController, 
  ],
  providers: [
    CentersService, 
  ],
  exports: [
    CentersService, 
  ],
})
export class CentersModule {}