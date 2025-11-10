import { SetMetadata } from '@nestjs/common';

export const RequiresTenant = () => SetMetadata('requiresTenant', true);

export const OptionalTenant = () => SetMetadata('requiresTenant', false);