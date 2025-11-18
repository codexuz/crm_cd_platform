import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Media, MediaType } from '../../entities/media.entity';
import { UpdateMediaDto, MediaFilterDto } from './dto/media.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  private getMediaTypeFromMime(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('sheet') ||
      mimeType.includes('presentation')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }

  async uploadMedia(
    file: Express.Multer.File,
    uploadedBy: string,
    altText?: string,
    description?: string,
    centerId?: string,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const mediaType = this.getMediaTypeFromMime(file.mimetype);
    const baseUrl = process.env.BASE_URL || 'https://backend.mockmee.uz';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    const media = this.mediaRepository.create({
      filename: file.filename,
      original_filename: file.originalname,
      file_path: file.path,
      url: fileUrl,
      mime_type: file.mimetype,
      file_size: file.size,
      media_type: mediaType,
      alt_text: altText,
      description: description,
      center_id: centerId,
      uploaded_by: uploadedBy,
    });

    return await this.mediaRepository.save(media);
  }

  async uploadMultipleMedia(
    files: Express.Multer.File[],
    uploadedBy: string,
    centerId?: string,
  ): Promise<Media[]> {
    const mediaItems: Media[] = [];

    for (const file of files) {
      const media = await this.uploadMedia(
        file,
        uploadedBy,
        undefined,
        undefined,
        centerId,
      );
      mediaItems.push(media);
    }

    return mediaItems;
  }

  async findAll(filterDto: MediaFilterDto): Promise<{
    data: Media[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { media_type, center_id, search, page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.uploader', 'uploader')
      .leftJoinAndSelect('media.center', 'center')
      .where('media.is_active = :isActive', { isActive: true });

    if (media_type) {
      queryBuilder.andWhere('media.media_type = :media_type', { media_type });
    }

    if (center_id) {
      queryBuilder.andWhere('media.center_id = :center_id', { center_id });
    }

    if (search) {
      queryBuilder.andWhere(
        '(media.original_filename LIKE :search OR media.description LIKE :search OR media.alt_text LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('media.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id, is_active: true },
      relations: ['uploader', 'center'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  async findByType(mediaType: MediaType, centerId?: string): Promise<Media[]> {
    const where: any = { media_type: mediaType, is_active: true };
    if (centerId) {
      where.center_id = centerId;
    }

    return await this.mediaRepository.find({
      where,
      relations: ['uploader', 'center'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.findOne(id);

    Object.assign(media, updateMediaDto);

    return await this.mediaRepository.save(media);
  }

  async delete(id: string): Promise<void> {
    const media = await this.findOne(id);

    // Delete physical file
    try {
      if (fs.existsSync(media.file_path)) {
        await unlinkAsync(media.file_path);
      }
    } catch (error) {
      console.error(`Failed to delete file: ${media.file_path}`, error);
    }

    // Soft delete from database
    media.is_active = false;
    await this.mediaRepository.save(media);
  }

  async hardDelete(id: string): Promise<void> {
    const media = await this.findOne(id);

    // Delete physical file
    try {
      if (fs.existsSync(media.file_path)) {
        await unlinkAsync(media.file_path);
      }
    } catch (error) {
      console.error(`Failed to delete file: ${media.file_path}`, error);
    }

    // Hard delete from database
    await this.mediaRepository.remove(media);
  }

  async getStorageStats(centerId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<MediaType, { count: number; size: number }>;
  }> {
    const where: any = { is_active: true };
    if (centerId) {
      where.center_id = centerId;
    }

    const allMedia = await this.mediaRepository.find({ where });

    const stats = {
      totalFiles: allMedia.length,
      totalSize: allMedia.reduce((sum, m) => sum + Number(m.file_size), 0),
      byType: {
        [MediaType.IMAGE]: { count: 0, size: 0 },
        [MediaType.VIDEO]: { count: 0, size: 0 },
        [MediaType.AUDIO]: { count: 0, size: 0 },
        [MediaType.DOCUMENT]: { count: 0, size: 0 },
        [MediaType.OTHER]: { count: 0, size: 0 },
      },
    };

    allMedia.forEach((media) => {
      stats.byType[media.media_type].count++;
      stats.byType[media.media_type].size += Number(media.file_size);
    });

    return stats;
  }
}
