import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required modules from decorator
    const requiredModules = this.reflector.get<string[]>(
      'requiredModules',
      context.getHandler(),
    );

    // If no specific modules required, allow access
    if (!requiredModules || requiredModules.length === 0) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const subscription = request.subscription;

    if (!subscription) {
      throw new ForbiddenException(
        'Subscription information not found. Please ensure SubscriptionGuard is applied.',
      );
    }

    // Get plan features from subscription.plan.features
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const planFeatures: Record<string, any> =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      subscription.plan?.features || {};

    // Check if subscription plan has the required modules enabled
    const missingModules = requiredModules.filter(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (module) => !planFeatures[module],
    );

    if (missingModules.length > 0) {
      throw new ForbiddenException(
        `Your subscription plan does not include access to: ${missingModules.join(', ')}. Please upgrade your plan.`,
      );
    }

    return true;
  }
}
