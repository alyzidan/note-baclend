import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantsService } from '../../tenants/tenants.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.tenantId) {
      throw new ForbiddenException('User does not belong to any tenant');
    }

    // Get tenant information
    const tenant = await this.tenantsService.findOne(user.tenantId);

    if (!tenant.isActive) {
      throw new ForbiddenException('Tenant is inactive');
    }

    // Add tenant information to request for use in controllers
    request.tenant = tenant;

    return true;
  }
}
