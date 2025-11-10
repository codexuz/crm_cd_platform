import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from '../middleware/tenant.middleware';

export const GetTenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: TenantRequest = ctx.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      return null;
    }

    return data ? tenant[data as keyof typeof tenant] : tenant;
  },
);