import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../entities';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);