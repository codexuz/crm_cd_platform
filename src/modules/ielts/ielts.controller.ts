import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { IeltsService } from './ielts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import {
  CreateIeltsTestDto,
  UpdateIeltsTestDto,
  CreateListeningDto,
  CreateReadingDto,
} from './dto/ielts-test.dto';

@Controller('ielts')
@UseGuards(JwtAuthGuard)
export class IeltsController {
  constructor(private readonly ieltsService: IeltsService) {}

  // IELTS Test endpoints
  @Post('tests')
  async createTest(
    @Body() createTestDto: CreateIeltsTestDto,
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.ieltsService.createTest(createTestDto, centerId, userId);
  }

  @Get('tests')
  async getAllTests(@GetTenant() centerId: number) {
    return await this.ieltsService.getAllTests(centerId);
  }

  @Get('tests/:id')
  async getTestById(
    @Param('id', ParseIntPipe) id: number,
    @GetTenant() centerId: number,
  ) {
    return await this.ieltsService.getTestById(id, centerId);
  }

  @Put('tests/:id')
  async updateTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestDto: UpdateIeltsTestDto,
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.ieltsService.updateTest(
      id,
      updateTestDto,
      centerId,
      userId,
    );
  }

  @Delete('tests/:id')
  async deleteTest(
    @Param('id', ParseIntPipe) id: number,
    @GetTenant() centerId: number,
  ) {
    await this.ieltsService.deleteTest(id, centerId);
    return { message: 'Test deleted successfully' };
  }

  // Listening endpoints
  @Post('listening')
  async createListening(
    @Body() createListeningDto: CreateListeningDto,
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.ieltsService.createListening(
      createListeningDto,
      centerId,
      userId,
    );
  }

  @Get('listening')
  async getAllListenings(@GetTenant() centerId: number) {
    return await this.ieltsService.getAllListenings(centerId);
  }

  @Get('listening/:id')
  async getListeningById(
    @Param('id', ParseIntPipe) id: number,
    @GetTenant() centerId: number,
  ) {
    return await this.ieltsService.getListeningById(id, centerId);
  }

  // Reading endpoints
  @Post('reading')
  async createReading(
    @Body() createReadingDto: CreateReadingDto,
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.ieltsService.createReading(
      createReadingDto,
      centerId,
      userId,
    );
  }

  @Get('reading')
  async getAllReadings(@GetTenant() centerId: number) {
    return await this.ieltsService.getAllReadings(centerId);
  }

  @Get('reading/:id')
  async getReadingById(
    @Param('id', ParseIntPipe) id: number,
    @GetTenant() centerId: number,
  ) {
    return await this.ieltsService.getReadingById(id, centerId);
  }

  // Create complete test (with listening and reading)
  @Post('tests/complete')
  async createCompleteTest(
    @Body()
    body: {
      test: CreateIeltsTestDto;
      listening: CreateListeningDto;
      reading: CreateReadingDto;
    },
    @GetTenant() centerId: number,
    @GetUser('sub') userId: number,
  ) {
    return await this.ieltsService.createCompleteTest(
      body.test,
      body.listening,
      body.reading,
      centerId,
      userId,
    );
  }
}
