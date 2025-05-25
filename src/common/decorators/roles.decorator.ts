import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'database/schema/common/role.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
