import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IeltsService } from './ielts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { RequiresModules } from '../../common/decorators/subscription.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import {
  CreateIeltsTestDto,
  UpdateIeltsTestDto,
  CreateListeningDto,
  CreateReadingDto,
  CreateWritingDto,
} from './dto/ielts-test.dto';

@Controller('ielts')
@UseGuards(JwtAuthGuard, SubscriptionGuard, ModuleAccessGuard)
@RequiresModules('ielts')
export class IeltsController {
  constructor(private readonly ieltsService: IeltsService) {}

  // IELTS Test endpoints
  @Post('centers/:centerId/tests')
  async createTest(
    @Param('centerId') centerId: string,
    @Body() createTestDto: CreateIeltsTestDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createTest(createTestDto, userId, centerId);
  }

  @Get('centers/:centerId/tests')
  async getAllTests(@Param('centerId') centerId: string) {
    return await this.ieltsService.getAllTests(centerId);
  }

  @Get('centers/:centerId/tests/:id')
  async getTestById(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    return await this.ieltsService.getTestById(id, centerId);
  }

  @Put('centers/:centerId/tests/:id')
  async updateTest(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
    @Body() updateTestDto: UpdateIeltsTestDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.updateTest(
      id,
      updateTestDto,
      userId,
      centerId,
    );
  }

  @Delete('centers/:centerId/tests/:id')
  async deleteTest(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    await this.ieltsService.deleteTest(id, centerId);
    return { message: 'Test deleted successfully' };
  }

  // Listening endpoints
  @Post('centers/:centerId/listening')
  async createListening(
    @Param('centerId') centerId: string,
    @Body() createListeningDto: CreateListeningDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createListening(
      createListeningDto,
      userId,
      centerId,
    );
  }

  @Get('centers/:centerId/listening')
  async getAllListenings(@Param('centerId') centerId: string) {
    return await this.ieltsService.getAllListenings(centerId);
  }

  @Get('centers/:centerId/listening/:id')
  async getListeningById(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    return await this.ieltsService.getListeningById(id, centerId);
  }

  @Get('centers/:centerId/tests/:testId/listening')
  async getListeningByTestId(
    @Param('centerId') centerId: string,
    @Param('testId') testId: string,
  ) {
    return await this.ieltsService.getListeningByTestId(testId, centerId);
  }

  // Reading endpoints
  @Post('centers/:centerId/reading')
  async createReading(
    @Param('centerId') centerId: string,
    @Body() createReadingDto: CreateReadingDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createReading(
      createReadingDto,
      userId,
      centerId,
    );
  }

  @Get('centers/:centerId/reading')
  async getAllReadings(@Param('centerId') centerId: string) {
    return await this.ieltsService.getAllReadings(centerId);
  }

  @Get('centers/:centerId/reading/:id')
  async getReadingById(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    return await this.ieltsService.getReadingById(id, centerId);
  }

  @Get('centers/:centerId/tests/:testId/reading')
  async getReadingByTestId(
    @Param('centerId') centerId: string,
    @Param('testId') testId: string,
  ) {
    return await this.ieltsService.getReadingByTestId(testId, centerId);
  }

  // Writing endpoints
  @Post('centers/:centerId/writing')
  async createWriting(
    @Param('centerId') centerId: string,
    @Body() createWritingDto: CreateWritingDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createWriting(
      createWritingDto,
      userId,
      centerId,
    );
  }

  @Get('centers/:centerId/writing')
  async getAllWritings(@Param('centerId') centerId: string) {
    return await this.ieltsService.getAllWritings(centerId);
  }

  @Get('centers/:centerId/writing/:id')
  async getWritingById(
    @Param('centerId') centerId: string,
    @Param('id') id: string,
  ) {
    return await this.ieltsService.getWritingById(id, centerId);
  }

  @Get('centers/:centerId/tests/:testId/writing')
  async getWritingByTestId(
    @Param('centerId') centerId: string,
    @Param('testId') testId: string,
  ) {
    return await this.ieltsService.getWritingByTestId(testId, centerId);
  }

  // Create complete test (with listening, reading, and writing)
  @Post('centers/:centerId/tests/complete')
  async createCompleteTest(
    @Param('centerId') centerId: string,
    @Body()
    body: {
      test: CreateIeltsTestDto;
      listening: CreateListeningDto;
      reading: CreateReadingDto;
      writing: CreateWritingDto;
    },
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createCompleteTest(
      body.test,
      body.listening,
      body.reading,
      body.writing,
      userId,
      centerId,
    );
  }
}
