import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from '../../tenants/entities/tenants.entity';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Tenant => {
    const request: any = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
