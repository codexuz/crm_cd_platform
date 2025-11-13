import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes that require an active subscription
 * @param required - Whether subscription is required (default: true)
 */
export const RequiresSubscription = (required: boolean = true) =>
  SetMetadata('requiresSubscription', required);

/**
 * Decorator to specify which modules are required for this route
 * @param modules - Array of module names required (e.g., ['leads', 'payments'])
 */
export const RequiresModules = (...modules: string[]) =>
  SetMetadata('requiredModules', modules);

/**
 * Decorator to mark routes that don't require subscription check
 */
export const NoSubscriptionRequired = () => RequiresSubscription(false);
