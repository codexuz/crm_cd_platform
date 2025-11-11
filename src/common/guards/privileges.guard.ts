import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrivilegeName } from '../../entities';

@Injectable()
export class PrivilegesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPrivileges = this.reflector.getAllAndOverride<
      PrivilegeName[]
    >('privileges', [context.getHandler(), context.getClass()]);

    if (!requiredPrivileges || requiredPrivileges.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admin has all privileges
    if (user.is_super_admin) {
      return true;
    }

    // Check if user has any of the required privileges through their roles
    const userPrivileges = new Set<string>();

    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((role: any) => {
        if (role.privileges && Array.isArray(role.privileges)) {
          role.privileges.forEach((privilege: any) => {
            userPrivileges.add(privilege.privilege_name);
          });
        }
      });
    }

    const hasPrivilege = requiredPrivileges.some((privilege) =>
      userPrivileges.has(privilege),
    );

    if (!hasPrivilege) {
      throw new ForbiddenException(
        `You do not have the required privileges. Required: ${requiredPrivileges.join(' or ')}`,
      );
    }

    return true;
  }
}
