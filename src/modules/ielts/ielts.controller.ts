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
  @Post('tests')
  async createTest(
    @Body() createTestDto: CreateIeltsTestDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createTest(createTestDto, userId);
  }

  @Get('tests')
  async getAllTests(@GetUser('sub') userId: string) {
    return await this.ieltsService.getAllTests(userId);
  }

  @Get('tests/:id')
  async getTestById(@Param('id') id: string, @GetUser('sub') userId: string) {
    return await this.ieltsService.getTestById(id, userId);
  }

  @Put('tests/:id')
  async updateTest(
    @Param('id') id: string,
    @Body() updateTestDto: UpdateIeltsTestDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.updateTest(id, updateTestDto, userId);
  }

  @Delete('tests/:id')
  async deleteTest(@Param('id') id: string, @GetUser('sub') userId: string) {
    await this.ieltsService.deleteTest(id, userId);
    return { message: 'Test deleted successfully' };
  }

  // Listening endpoints
  @Post('listening')
  async createListening(
    @Body() createListeningDto: CreateListeningDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createListening(createListeningDto, userId);
  }

  @Get('listening')
  async getAllListenings(@GetUser('sub') userId: string) {
    return await this.ieltsService.getAllListenings(userId);
  }

  @Get('listening/:id')
  async getListeningById(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.getListeningById(id, userId);
  }

  // Reading endpoints
  @Post('reading')
  async createReading(
    @Body() createReadingDto: CreateReadingDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createReading(createReadingDto, userId);
  }

  @Get('reading')
  async getAllReadings(@GetUser('sub') userId: string) {
    return await this.ieltsService.getAllReadings(userId);
  }

  @Get('reading/:id')
  async getReadingById(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.getReadingById(id, userId);
  }

  // Writing endpoints
  @Post('writing')
  async createWriting(
    @Body() createWritingDto: CreateWritingDto,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.createWriting(createWritingDto, userId);
  }

  @Get('writing')
  async getAllWritings(@GetUser('sub') userId: string) {
    return await this.ieltsService.getAllWritings(userId);
  }

  @Get('writing/:id')
  async getWritingById(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
  ) {
    return await this.ieltsService.getWritingById(id, userId);
  }

  // Create complete test (with listening, reading, and writing)
  @Post('tests/complete')
  async createCompleteTest(
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
    );
  }
}
