import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantRequest } from '../middleware/tenant.middleware';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: TenantRequest = context.switchToHttp().getRequest();
    
    // Check if tenant context is required
    const requiresTenant = this.reflector.getAllAndOverride<boolean>('requiresTenant', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If tenant is not required, allow access
    if (!requiresTenant) {
      return true;
    }

    // If tenant is required but not present, deny access
    if (!request.tenant) {
      throw new ForbiddenException('This endpoint requires tenant context (subdomain)');
    }

    // If user is authenticated, check if they belong to the tenant center
    const user = request.user as any;
    if (user && user.center_id && user.center_id !== request.tenant.center.id) {
      throw new ForbiddenException('Access denied: User does not belong to this tenant');
    }

    return true;
  }
}