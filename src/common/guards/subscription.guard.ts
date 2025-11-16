import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from '../../entities/subscription.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if subscription check is required for this route
    const requiresSubscription = this.reflector.get<boolean>(
      'requiresSubscription',
      context.getHandler(),
    );

    // If no subscription required, allow access
    if (requiresSubscription === false) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get centerId from user or request params
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const centerId =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      user.center_id || request.params?.centerId || request.body?.center_id;

    if (!centerId) {
      throw new ForbiddenException('Center ID not found');
    }

    // Check if center has an active subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        center_id: centerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new ForbiddenException(
        'No active subscription found. Please subscribe to access this feature.',
      );
    }

    // Check if subscription has expired
    if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to continue.',
      );
    }

    // Attach subscription to request for further use
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    request.subscription = subscription;

    return true;
  }
}
