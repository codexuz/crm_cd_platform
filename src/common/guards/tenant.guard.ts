import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check if tenant context is required
    const requiresTenant = this.reflector.getAllAndOverride<boolean>(
      'requiresTenant',
      [context.getHandler(), context.getClass()],
    );

    // If tenant is not required, allow access
    if (!requiresTenant) {
      return true;
    }

    // Check if user is authenticated and has center_id in JWT
    const user = request.user as any;
    if (!user || !user.center_id) {
      throw new ForbiddenException(
        'This endpoint requires authentication with a valid center',
      );
    }

    return true;
  }
}
