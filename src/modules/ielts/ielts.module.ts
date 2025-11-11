import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IeltsController } from './ielts.controller';
import { IeltsService } from './ielts.service';
import {
  IeltsTest,
  IeltsListening,
  IeltsListeningPart,
  IeltsReading,
  IeltsReadingPart,
  IeltsQuestion,
  IeltsAudio,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IeltsTest,
      IeltsListening,
      IeltsListeningPart,
      IeltsReading,
      IeltsReadingPart,
      IeltsQuestion,
      IeltsAudio,
    ]),
  ],
  controllers: [IeltsController],
  providers: [IeltsService],
  exports: [IeltsService],
})
export class IeltsModule {}
