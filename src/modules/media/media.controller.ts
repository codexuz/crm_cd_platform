import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import {
  UpdateMediaDto,
  MediaFilterDto,
  UploadMediaDto,
} from './dto/media.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Media, MediaType } from '../../entities/media.entity';
import { RoleName } from '../../entities';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
      fileFilter: (req, file, callback) => {
        // Allow all file types
        callback(null, true);
      },
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
    @GetUser('id') userId: string,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.mediaService.uploadMedia(
      file,
      userId,
      uploadMediaDto.alt_text,
      uploadMediaDto.description,
      uploadMediaDto.center_id,
    );
  }

  @Post('upload/multiple')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.TEACHER)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
      },
      fileFilter: (req, file, callback) => {
        callback(null, true);
      },
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('center_id') centerId: string,
    @GetUser('id') userId: string,
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return await this.mediaService.uploadMultipleMedia(files, userId, centerId);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.TEACHER, RoleName.STUDENT)
  async findAll(@Query() filterDto: MediaFilterDto): Promise<{
    data: Media[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.mediaService.findAll(filterDto);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  async getStats(@Query('center_id') centerId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<MediaType, { count: number; size: number }>;
  }> {
    return await this.mediaService.getStorageStats(centerId);
  }

  @Get('type/:type')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.TEACHER, RoleName.STUDENT)
  async findByType(
    @Param('type') type: MediaType,
    @Query('center_id') centerId?: string,
  ): Promise<Media[]> {
    return await this.mediaService.findByType(type, centerId);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.TEACHER, RoleName.STUDENT)
  async findOne(@Param('id') id: string): Promise<Media> {
    return await this.mediaService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.TEACHER)
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ): Promise<Media> {
    return await this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.mediaService.delete(id);
    return { message: 'Media deleted successfully' };
  }

  @Delete(':id/hard')
  @Roles(RoleName.ADMIN)
  async hardDelete(@Param('id') id: string): Promise<{ message: string }> {
    await this.mediaService.hardDelete(id);
    return { message: 'Media permanently deleted' };
  }
}
