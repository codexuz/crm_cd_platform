import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Invoice, InvoiceStatus } from '../../entities/invoice.entity';
import { Center } from '../../entities';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
  ) {}

  // ==================== Subscription Plans ====================

  async createPlan(
    createPlanDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const plan = this.subscriptionPlanRepository.create(createPlanDto);
    return this.subscriptionPlanRepository.save(plan);
  }

  async getAllPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
    const where = activeOnly ? { is_active: true } : {};
    return this.subscriptionPlanRepository.find({
      where,
      order: { price_month: 'ASC' },
    });
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }

    return plan;
  }

  async updatePlan(
    id: string,
    updatePlanDto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const plan = await this.getPlanById(id);
    Object.assign(plan, updatePlanDto);
    return this.subscriptionPlanRepository.save(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.getPlanById(id);
    
    // Check if plan has active subscriptions
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: {
        plan_id: id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete plan with active subscriptions',
      );
    }

    plan.is_active = false;
    await this.subscriptionPlanRepository.save(plan);
  }

  // ==================== Subscriptions ====================

  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    // Verify center exists
    const center = await this.centerRepository.findOne({
      where: { id: createSubscriptionDto.center_id, is_active: true },
    });

    if (!center) {
      throw new NotFoundException(
        `Center with ID ${createSubscriptionDto.center_id} not found`,
      );
    }

    // Verify plan exists
    const plan = await this.getPlanById(createSubscriptionDto.plan_id);

    if (!plan.is_active) {
      throw new BadRequestException('Selected plan is not available');
    }

    // Check if center already has an active subscription
    const existingActive = await this.subscriptionRepository.findOne({
      where: {
        center_id: createSubscriptionDto.center_id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingActive) {
      throw new ConflictException(
        'Center already has an active subscription. Please cancel or upgrade the existing subscription.',
      );
    }

    const subscription = this.subscriptionRepository.create(createSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async getAllSubscriptions(
    centerId?: string,
    status?: SubscriptionStatus,
  ): Promise<Subscription[]> {
    const queryBuilder = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.center', 'center')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .orderBy('subscription.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('subscription.center_id = :centerId', { centerId });
    }

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['center', 'plan', 'invoices'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async getActiveByCenterId(centerId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        center_id: centerId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });
  }

  async updateSubscription(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    // If changing plan, verify new plan exists
    if (updateSubscriptionDto.plan_id) {
      const newPlan = await this.getPlanById(updateSubscriptionDto.plan_id);
      if (!newPlan.is_active) {
        throw new BadRequestException('Selected plan is not available');
      }
    }

    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(id: string, immediate = false): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active subscriptions can be canceled');
    }

    if (immediate) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.end_date = new Date();
    } else {
      subscription.cancel_at_period_end = true;
    }

    return this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(id: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.cancel_at_period_end = false;

    // Set new renewal date (30 days from now as example)
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);
    subscription.renews_at = renewalDate;

    return this.subscriptionRepository.save(subscription);
  }

  // Check and update expired subscriptions
  async checkExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: [
        {
          status: SubscriptionStatus.ACTIVE,
        },
      ],
    });

    for (const subscription of expiredSubscriptions) {
      if (subscription.end_date && new Date(subscription.end_date) < now) {
        subscription.status = SubscriptionStatus.EXPIRED;
        await this.subscriptionRepository.save(subscription);
      }
    }
  }

  // Check module access based on subscription plan features
  async hasModuleAccess(centerId: string, moduleName: string): Promise<boolean> {
    const subscription = await this.getActiveByCenterId(centerId);

    if (!subscription || !subscription.plan) {
      return false;
    }

    const features = subscription.plan.features;
    return features[moduleName] === true;
  }

  // ==================== Invoices ====================

  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Verify subscription exists
    const subscription = await this.getSubscriptionById(
      createInvoiceDto.subscription_id,
    );

    // Verify center matches
    if (subscription.center_id !== createInvoiceDto.center_id) {
      throw new BadRequestException('Center ID does not match subscription');
    }

    const invoice = this.invoiceRepository.create(createInvoiceDto);
    return this.invoiceRepository.save(invoice);
  }

  async getAllInvoices(
    centerId?: string,
    subscriptionId?: string,
    status?: InvoiceStatus,
  ): Promise<Invoice[]> {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.center', 'center')
      .leftJoinAndSelect('invoice.subscription', 'subscription')
      .orderBy('invoice.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('invoice.center_id = :centerId', { centerId });
    }

    if (subscriptionId) {
      queryBuilder.andWhere('invoice.subscription_id = :subscriptionId', {
        subscriptionId,
      });
    }

    if (status) {
      queryBuilder.andWhere('invoice.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['center', 'subscription', 'subscription.plan'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateInvoice(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    // If marking as paid, set paid_at if not provided
    if (
      updateInvoiceDto.status === InvoiceStatus.PAID &&
      !updateInvoiceDto.paid_at
    ) {
      updateInvoiceDto.paid_at = new Date().toISOString();
    }

    Object.assign(invoice, updateInvoiceDto);
    return this.invoiceRepository.save(invoice);
  }

  async markInvoiceAsPaid(
    id: string,
    transactionId: string,
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    invoice.status = InvoiceStatus.PAID;
    invoice.transaction_id = transactionId;
    invoice.paid_at = new Date();

    return this.invoiceRepository.save(invoice);
  }
}
