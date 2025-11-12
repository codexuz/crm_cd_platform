import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../../entities';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const paymentData = {
      ...createPaymentDto,
      date: new Date(createPaymentDto.date),
    };
    
    const payment = this.paymentRepository.create(paymentData);
    return this.paymentRepository.save(payment);
  }

  async findAll(centerId?: string, status?: PaymentStatus): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.center', 'center')
      .leftJoinAndSelect('payment.student', 'student')
      .orderBy('payment.date', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('payment.center_id = :centerId', { centerId });
    }

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['center', 'student'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByStudent(studentId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { student_id: studentId },
      relations: ['center'],
      order: { date: 'DESC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string, centerId?: string): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.center', 'center')
      .leftJoinAndSelect('payment.student', 'student')
      .where('payment.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .orderBy('payment.date', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('payment.center_id = :centerId', { centerId });
    }

    return queryBuilder.getMany();
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    await this.findOne(id); // Ensure payment exists

    const updateData = {
      ...updatePaymentDto,
      date: updatePaymentDto.date ? new Date(updatePaymentDto.date) : undefined,
    };

    await this.paymentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Ensure payment exists
    await this.paymentRepository.delete(id);
  }

  async getPaymentStats(centerId?: string, month?: string) {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');
    
    if (centerId) {
      queryBuilder.where('payment.center_id = :centerId', { centerId });
    }

    if (month) {
      // Format: YYYY-MM
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      queryBuilder.andWhere('payment.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalPayments = await queryBuilder.getCount();
    
    const totalAmount = await queryBuilder
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    const statusStats = await queryBuilder
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'amount')
      .groupBy('payment.status')
      .getRawMany();

    const methodStats = await queryBuilder
      .select('payment.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'amount')
      .groupBy('payment.method')
      .getRawMany();

    return {
      totalPayments,
      totalAmount: parseFloat(totalAmount?.total || '0'),
      statusBreakdown: statusStats.reduce((acc, curr) => {
        acc[curr.status] = {
          count: parseInt(curr.count),
          amount: parseFloat(curr.amount || '0'),
        };
        return acc;
      }, {}),
      methodBreakdown: methodStats.reduce((acc, curr) => {
        acc[curr.method] = {
          count: parseInt(curr.count),
          amount: parseFloat(curr.amount || '0'),
        };
        return acc;
      }, {}),
    };
  }
}