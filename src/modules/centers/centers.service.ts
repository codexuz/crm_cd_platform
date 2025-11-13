import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Center } from '../../entities';
import { CreateCenterDto, UpdateCenterDto } from './dto/center.dto';

@Injectable()
export class CentersService {
  constructor(
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
  ) {}

  async create(
    createCenterDto: CreateCenterDto,
    userId?: string,
  ): Promise<Center> {
    // If userId provided (owner creating center), use it as owner_id
    const owner_id = userId || createCenterDto.owner_id;

    if (!owner_id) {
      throw new Error('Owner ID is required to create a center');
    }

    // Generate subdomain from name if not provided
    if (!createCenterDto.subdomain && createCenterDto.name) {
      const slug = this.generateSubdomainFromName(createCenterDto.name);

      // Check if subdomain is already taken
      let subdomain = slug;
      let counter = 1;
      while (await this.isSubdomainTaken(subdomain)) {
        subdomain = `${slug}${counter}`;
        counter++;
      }

      createCenterDto.subdomain = subdomain;
    }

    const center = this.centerRepository.create({
      ...createCenterDto,
      owner_id,
    });
    return this.centerRepository.save(center);
  }

  private generateSubdomainFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  private async isSubdomainTaken(subdomain: string): Promise<boolean> {
    const existing = await this.centerRepository.findOne({
      where: { subdomain },
    });
    return !!existing;
  }

  async findAll(): Promise<Center[]> {
    return this.centerRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Center> {
    const center = await this.centerRepository.findOne({
      where: { id, is_active: true },
      relations: ['users', 'leads', 'groups'],
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    return center;
  }

  async findByOwner(owner_id: string): Promise<Center[]> {
    return this.centerRepository.find({
      where: { owner_id, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: string,
    updateCenterDto: UpdateCenterDto,
    userId: string,
  ): Promise<Center> {
    const center = await this.findOne(id);

    // Check if user is the owner (you can enhance this with proper authorization)
    if (center.owner_id !== userId) {
      throw new ForbiddenException('You can only update centers you own');
    }

    await this.centerRepository.update(id, updateCenterDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const center = await this.findOne(id);

    // Check if user is the owner
    if (center.owner_id !== userId) {
      throw new ForbiddenException('You can only delete centers you own');
    }

    await this.centerRepository.update(id, { is_active: false });
  }

  async getCenterStats(centerId: string) {
    const center = await this.centerRepository.findOne({
      where: { id: centerId },
      relations: ['users', 'leads', 'groups', 'payments', 'tests'],
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${centerId} not found`);
    }

    return {
      totalUsers: center.users?.length || 0,
      totalLeads: center.leads?.length || 0,
      totalGroups: center.groups?.length || 0,
      totalPayments: center.payments?.length || 0,
    };
  }
}
