import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../../entities';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const leadData = {
      ...createLeadDto,
      follow_up_date: createLeadDto.follow_up_date
        ? new Date(createLeadDto.follow_up_date)
        : undefined,
    };
    const lead = this.leadRepository.create(leadData);
    return this.leadRepository.save(lead);
  }

  async findAll(centerId?: string, status?: LeadStatus): Promise<Lead[]> {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.center', 'center')
      .leftJoinAndSelect('lead.assigned_to_user', 'assigned_user')
      .leftJoinAndSelect('lead.trail_lessons', 'trail_lessons')
      .orderBy('lead.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('lead.center_id = :centerId', { centerId });
    }

    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: [
        'center',
        'assigned_to_user',
        'trail_lessons',
        'trail_lessons.teacher',
      ],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async findByAssignedUser(userId: string, centerId?: string): Promise<Lead[]> {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.center', 'center')
      .leftJoinAndSelect('lead.trail_lessons', 'trail_lessons')
      .where('lead.assigned_to = :userId', { userId })
      .orderBy('lead.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('lead.center_id = :centerId', { centerId });
    }

    return queryBuilder.getMany();
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    await this.findOne(id);

    // Optional: Check if user has permission to update this lead
    // You can implement center-based or assignment-based restrictions here

    const updateData = {
      ...updateLeadDto,
      follow_up_date: updateLeadDto.follow_up_date
        ? new Date(updateLeadDto.follow_up_date)
        : undefined,
    };

    await this.leadRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    // Optional: Add permission checks here

    await this.leadRepository.delete(id);
  }

  async getLeadStats(centerId?: string) {
    const queryBuilder = this.leadRepository.createQueryBuilder('lead');

    if (centerId) {
      queryBuilder.where('lead.center_id = :centerId', { centerId });
    }

    const totalLeads = await queryBuilder.getCount();

    const statusStats = await queryBuilder
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    return {
      totalLeads,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      statusBreakdown: statusStats.reduce(
        (acc, curr) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          acc[curr.status] = parseInt(curr.count);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async convertToStudent(leadId: string): Promise<{ message: string }> {
    await this.findOne(leadId);

    // Update lead status to enrolled
    await this.leadRepository.update(leadId, { status: LeadStatus.ENROLLED });

    // Here you would typically create a new user account for the student
    // and potentially add them to a group, but that would require the UsersService

    return { message: 'Lead successfully converted to student' };
  }
}
