import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetTenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // User object from JWT (set by JwtAuthGuard)

    if (!user || !user.center_id) {
      return null;
    }

    // Return center_id from JWT token
    return user.center_id;
  },
);
