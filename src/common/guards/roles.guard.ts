import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'database/schema/common/role.enum';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    let user;
    if (context.getType() === 'http') {
      // REST
      const request = context.switchToHttp().getRequest();
      user = request.user;
    } else {
      // GraphQL
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext().req.user;
    }

    if (!user) {
      return false;
    }
    
    return requiredRoles.includes(user.role);
  }
}