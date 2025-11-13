import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../entities/subscription.entity';
import { Center } from '../../entities';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  // Default features for each plan
  private readonly planFeatures = {
    [SubscriptionPlan.BASIC]: {
      max_users: 10,
      max_students: 100,
      max_groups: 5,
      max_storage_gb: 5,
      enabled_modules: ['groups', 'attendance'],
      custom_branding: false,
      priority_support: false,
      api_access: false,
      advanced_reporting: false,
    },
    [SubscriptionPlan.PRO]: {
      max_users: 50,
      max_students: 500,
      max_groups: 25,
      max_storage_gb: 50,
      enabled_modules: ['leads', 'groups', 'attendance', 'payments', 'salary'],
      custom_branding: true,
      priority_support: true,
      api_access: false,
      advanced_reporting: true,
    },
    [SubscriptionPlan.ENTERPRISE]: {
      max_users: -1, // unlimited
      max_students: -1, // unlimited
      max_groups: -1, // unlimited
      max_storage_gb: 500,
      enabled_modules: [
        'leads',
        'groups',
        'attendance',
        'payments',
        'salary',
        'ielts',
      ],
      custom_branding: true,
      priority_support: true,
      api_access: true,
      advanced_reporting: true,
    },
  };

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
  ) {}

  async create(
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

    // Set default features based on plan if not provided
    const features =
      createSubscriptionDto.features ||
      this.planFeatures[createSubscriptionDto.plan_type];

    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      features,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(
    centerId?: string,
    status?: SubscriptionStatus,
    plan?: SubscriptionPlan,
  ): Promise<Subscription[]> {
    const queryBuilder = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.center', 'center')
      .orderBy('subscription.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('subscription.center_id = :centerId', { centerId });
    }

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    if (plan) {
      queryBuilder.andWhere('subscription.plan_type = :plan', { plan });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['center'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findActiveByCenter(centerId: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        center_id: centerId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['center'],
    });

    return subscription;
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    await this.findOne(id);

    await this.subscriptionRepository.update(id, updateSubscriptionDto);
    return this.findOne(id);
  }

  async upgrade(
    centerId: string,
    upgradeDto: UpgradeSubscriptionDto,
  ): Promise<Subscription> {
    const activeSubscription = await this.findActiveByCenter(centerId);

    if (!activeSubscription) {
      throw new NotFoundException(
        'No active subscription found for this center',
      );
    }

    // Validate upgrade path
    const planOrder = [
      SubscriptionPlan.BASIC,
      SubscriptionPlan.PRO,
      SubscriptionPlan.ENTERPRISE,
    ];
    const currentPlanIndex = planOrder.indexOf(activeSubscription.plan_type);
    const newPlanIndex = planOrder.indexOf(upgradeDto.new_plan);

    if (newPlanIndex <= currentPlanIndex) {
      throw new BadRequestException(
        'Can only upgrade to a higher plan. Use downgrade for lower plans.',
      );
    }

    // Update subscription
    const newFeatures = this.planFeatures[upgradeDto.new_plan];
    await this.subscriptionRepository.update(activeSubscription.id, {
      plan_type: upgradeDto.new_plan,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      features: newFeatures as any,
      billing_cycle:
        upgradeDto.billing_cycle || activeSubscription.billing_cycle,
      notes: `Upgraded from ${activeSubscription.plan_type} to ${upgradeDto.new_plan}`,
    });

    return this.findOne(activeSubscription.id);
  }

  async downgrade(
    centerId: string,
    newPlan: SubscriptionPlan,
  ): Promise<Subscription> {
    const activeSubscription = await this.findActiveByCenter(centerId);

    if (!activeSubscription) {
      throw new NotFoundException(
        'No active subscription found for this center',
      );
    }

    // Validate downgrade path
    const planOrder = [
      SubscriptionPlan.BASIC,
      SubscriptionPlan.PRO,
      SubscriptionPlan.ENTERPRISE,
    ];
    const currentPlanIndex = planOrder.indexOf(activeSubscription.plan_type);
    const newPlanIndex = planOrder.indexOf(newPlan);

    if (newPlanIndex >= currentPlanIndex) {
      throw new BadRequestException(
        'Can only downgrade to a lower plan. Use upgrade for higher plans.',
      );
    }

    // Update subscription
    const newFeatures = this.planFeatures[newPlan];
    await this.subscriptionRepository.update(activeSubscription.id, {
      plan_type: newPlan,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      features: newFeatures as any,
      notes: `Downgraded from ${activeSubscription.plan_type} to ${newPlan}`,
    });

    return this.findOne(activeSubscription.id);
  }

  async cancel(
    centerId: string,
    cancelDto: CancelSubscriptionDto,
  ): Promise<Subscription> {
    const activeSubscription = await this.findActiveByCenter(centerId);

    if (!activeSubscription) {
      throw new NotFoundException(
        'No active subscription found for this center',
      );
    }

    const updateData: Partial<Subscription> = {
      status: SubscriptionStatus.CANCELLED,
      auto_renew: false,
      notes: cancelDto.reason
        ? `Cancelled: ${cancelDto.reason}`
        : 'Subscription cancelled',
    };

    if (cancelDto.immediate) {
      updateData.end_date = new Date();
    }

    await this.subscriptionRepository.update(activeSubscription.id, updateData);
    return this.findOne(activeSubscription.id);
  }

  async renew(
    id: string,
    renewalPeriodDays: number = 30,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== SubscriptionStatus.EXPIRED) {
      throw new BadRequestException(
        'Only expired subscriptions can be renewed',
      );
    }

    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + renewalPeriodDays);

    await this.subscriptionRepository.update(id, {
      status: SubscriptionStatus.ACTIVE,
      start_date: newStartDate,
      end_date: newEndDate,
      notes: 'Subscription renewed',
    });

    return this.findOne(id);
  }

  async checkAndUpdateExpired(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.subscriptionRepository.update(
      {
        status: SubscriptionStatus.ACTIVE,
        end_date: LessThan(today),
      },
      {
        status: SubscriptionStatus.EXPIRED,
      },
    );

    return result.affected || 0;
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.remove(subscription);
  }

  async getSubscriptionStats() {
    const totalSubscriptions = await this.subscriptionRepository.count();

    const byPlan = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('subscription.plan_type', 'plan')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subscription.plan_type')
      .getRawMany();

    const byStatus = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('subscription.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('subscription.status')
      .getRawMany();

    const activeCount = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const revenue = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .select('SUM(subscription.price)', 'total')
      .where('subscription.status = :status', {
        status: SubscriptionStatus.ACTIVE,
      })
      .getRawOne();

    return {
      total: totalSubscriptions,
      active: activeCount,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      byPlan: byPlan.reduce(
        (acc: Record<string, number>, curr: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          acc[curr.plan] = parseInt(curr.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      byStatus: byStatus.reduce(
        (acc: Record<string, number>, curr: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          acc[curr.status] = parseInt(curr.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      monthlyRevenue: parseFloat(revenue?.total || '0'),
    };
  }

  getPlanFeatures(plan: SubscriptionPlan) {
    return this.planFeatures[plan];
  }
}
