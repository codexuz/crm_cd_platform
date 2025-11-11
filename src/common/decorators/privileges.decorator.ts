import { SetMetadata } from '@nestjs/common';
import { PrivilegeName } from '../../entities';

export const PRIVILEGES_KEY = 'privileges';
export const RequirePrivileges = (...privileges: PrivilegeName[]) =>
  SetMetadata(PRIVILEGES_KEY, privileges);
