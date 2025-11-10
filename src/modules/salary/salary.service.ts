import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherSalary, SalaryStatus, User } from '../../entities';
import { CreateTeacherSalaryDto, UpdateTeacherSalaryDto, MarkSalaryPaidDto } from './dto/salary.dto';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(TeacherSalary)
    private salaryRepository: Repository<TeacherSalary>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createSalaryDto: CreateTeacherSalaryDto): Promise<TeacherSalary> {
    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { id: createSalaryDto.teacher_id, is_active: true },
      relations: ['roles'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createSalaryDto.teacher_id} not found`);
    }

    // Check if salary record already exists for this teacher and month
    const existingSalary = await this.salaryRepository.findOne({
      where: {
        teacher_id: createSalaryDto.teacher_id,
        month: createSalaryDto.month,
      },
    });

    if (existingSalary) {
      throw new BadRequestException(`Salary record for ${createSalaryDto.month} already exists for this teacher`);
    }

    const salary = this.salaryRepository.create(createSalaryDto);
    return this.salaryRepository.save(salary);
  }

  async findAll(centerId?: number, status?: SalaryStatus, month?: string): Promise<TeacherSalary[]> {
    const queryBuilder = this.salaryRepository
      .createQueryBuilder('salary')
      .leftJoinAndSelect('salary.teacher', 'teacher')
      .leftJoinAndSelect('teacher.center', 'center')
      .orderBy('salary.month', 'DESC')
      .addOrderBy('salary.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('teacher.center_id = :centerId', { centerId });
    }

    if (status) {
      queryBuilder.andWhere('salary.status = :status', { status });
    }

    if (month) {
      queryBuilder.andWhere('salary.month = :month', { month });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<TeacherSalary> {
    const salary = await this.salaryRepository.findOne({
      where: { id },
      relations: ['teacher', 'teacher.center'],
    });

    if (!salary) {
      throw new NotFoundException(`Salary record with ID ${id} not found`);
    }

    return salary;
  }

  async findByTeacher(teacherId: number, year?: number): Promise<TeacherSalary[]> {
    const queryBuilder = this.salaryRepository
      .createQueryBuilder('salary')
      .where('salary.teacher_id = :teacherId', { teacherId })
      .orderBy('salary.month', 'DESC');

    if (year) {
      queryBuilder.andWhere('salary.month LIKE :year', { year: `${year}-%` });
    }

    return queryBuilder.getMany();
  }

  async update(id: number, updateSalaryDto: UpdateTeacherSalaryDto): Promise<TeacherSalary> {
    await this.findOne(id); // Ensure salary record exists

    const updateData = {
      ...updateSalaryDto,
      paid_date: updateSalaryDto.paid_date ? new Date(updateSalaryDto.paid_date) : undefined,
    };

    await this.salaryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async markAsPaid(id: number, markPaidDto: MarkSalaryPaidDto): Promise<TeacherSalary> {
    const salary = await this.findOne(id);

    if (salary.status === SalaryStatus.PAID) {
      throw new BadRequestException('Salary is already marked as paid');
    }

    const updateData = {
      status: SalaryStatus.PAID,
      paid_date: new Date(markPaidDto.paid_date),
      notes: markPaidDto.notes || salary.notes,
    };

    await this.salaryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Ensure salary record exists
    await this.salaryRepository.delete(id);
  }

  async getSalaryStats(centerId?: number, year?: number) {
    const queryBuilder = this.salaryRepository
      .createQueryBuilder('salary')
      .leftJoin('salary.teacher', 'teacher');

    if (centerId) {
      queryBuilder.andWhere('teacher.center_id = :centerId', { centerId });
    }

    if (year) {
      queryBuilder.andWhere('salary.month LIKE :year', { year: `${year}-%` });
    }

    const totalRecords = await queryBuilder.getCount();

    const totalAmount = await queryBuilder
      .select('SUM(salary.amount)', 'total')
      .getRawOne();

    const statusStats = await queryBuilder
      .select('salary.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(salary.amount)', 'amount')
      .groupBy('salary.status')
      .getRawMany();

    const monthlyStats = await queryBuilder
      .select('salary.month', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(salary.amount)', 'amount')
      .addSelect('AVG(salary.amount)', 'average')
      .groupBy('salary.month')
      .orderBy('salary.month', 'DESC')
      .limit(12) // Last 12 months
      .getRawMany();

    return {
      totalRecords,
      totalAmount: parseFloat(totalAmount?.total || '0'),
      statusBreakdown: statusStats.reduce((acc, curr) => {
        acc[curr.status] = {
          count: parseInt(curr.count),
          amount: parseFloat(curr.amount || '0'),
        };
        return acc;
      }, {}),
      monthlyBreakdown: monthlyStats.map(stat => ({
        month: stat.month,
        count: parseInt(stat.count),
        totalAmount: parseFloat(stat.amount || '0'),
        averageAmount: parseFloat(stat.average || '0'),
      })),
    };
  }

  async generateMonthlySalaries(centerId: number, month: string, hourlyRate: number = 25): Promise<TeacherSalary[]> {
    // Find all teachers in the center
    const teachers = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.teaching_groups', 'groups')
      .where('user.center_id = :centerId', { centerId })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .andWhere('role.role_name = :roleName', { roleName: 'teacher' })
      .getMany();

    const generatedSalaries: TeacherSalary[] = [];

    for (const teacher of teachers) {
      // Check if salary already exists for this month
      const existingSalary = await this.salaryRepository.findOne({
        where: {
          teacher_id: teacher.id,
          month: month,
        },
      });

      if (!existingSalary) {
        // Calculate estimated hours based on teaching groups (simplified calculation)
        const estimatedHours = teacher.teaching_groups ? teacher.teaching_groups.length * 10 : 20; // 10 hours per group or default 20
        const amount = estimatedHours * hourlyRate;

        const salaryData: CreateTeacherSalaryDto = {
          teacher_id: teacher.id,
          month: month,
          amount: amount,
          hours_taught: estimatedHours,
          hourly_rate: hourlyRate,
          status: SalaryStatus.PENDING,
          notes: `Auto-generated salary for ${month}`,
        };

        const salary = await this.create(salaryData);
        generatedSalaries.push(salary);
      }
    }

    return generatedSalaries;
  }

  async getTeacherSalarySummary(teacherId: number, year?: number) {
    const queryBuilder = this.salaryRepository
      .createQueryBuilder('salary')
      .where('salary.teacher_id = :teacherId', { teacherId });

    if (year) {
      queryBuilder.andWhere('salary.month LIKE :year', { year: `${year}-%` });
    }

    const totalEarnings = await queryBuilder
      .select('SUM(salary.amount)', 'total')
      .getRawOne();

    const totalHours = await queryBuilder
      .select('SUM(salary.hours_taught)', 'hours')
      .getRawOne();

    const paidAmount = await queryBuilder
      .andWhere('salary.status = :status', { status: SalaryStatus.PAID })
      .select('SUM(salary.amount)', 'paid')
      .getRawOne();

    const pendingAmount = await queryBuilder
      .andWhere('salary.status = :status', { status: SalaryStatus.PENDING })
      .select('SUM(salary.amount)', 'pending')
      .getRawOne();

    return {
      teacherId,
      year: year || 'All time',
      totalEarnings: parseFloat(totalEarnings?.total || '0'),
      totalHours: parseFloat(totalHours?.hours || '0'),
      paidAmount: parseFloat(paidAmount?.paid || '0'),
      pendingAmount: parseFloat(pendingAmount?.pending || '0'),
    };
  }
}