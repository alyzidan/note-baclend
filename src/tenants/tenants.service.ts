import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenants.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if tenant with same name or slug exists

    const existingTenant = await this.tenantsRepository.findOne({
      where: [{ name: createTenantDto.name }, { slug: createTenantDto.slug }],
    });

    if (existingTenant) {
      if (existingTenant.name === createTenantDto.name) {
        throw new ConflictException('Tenant with this name already exists');
      }
      if (existingTenant.slug === createTenantDto.slug) {
        throw new ConflictException('Tenant with this slug already exists');
      }
    }

    // Check domain uniqueness if provided
    if (createTenantDto.domain) {
      const existingDomain = await this.tenantsRepository.findOne({
        where: { domain: createTenantDto.domain },
      });

      if (existingDomain) {
        throw new ConflictException('Tenant with this domain already exists');
      }
    }

    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      settings: createTenantDto.settings || {},
    });

    return await this.tenantsRepository.save(tenant);
  }

  async findAll(includeInactive: boolean = false): Promise<Tenant[]> {
    const query = this.tenantsRepository.createQueryBuilder('tenant');

    if (!includeInactive) {
      query.where('tenant.isActive = :isActive', { isActive: true });
    }

    return await query
      .leftJoinAndSelect('tenant.users', 'users')
      .orderBy('tenant.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['users', 'notes'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { slug, isActive: true },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug "${slug}" not found`);
    }

    return tenant;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return await this.tenantsRepository.findOne({
      where: { domain, isActive: true },
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Check for conflicts if updating name, slug, or domain
    if (
      updateTenantDto.name ||
      updateTenantDto.slug ||
      updateTenantDto.domain
    ) {
      const conflicts = [];

      if (updateTenantDto.name && updateTenantDto.name !== tenant.name) {
        const existingName = await this.tenantsRepository.findOne({
          where: { name: updateTenantDto.name },
        });
        if (existingName && existingName.id !== id) {
          conflicts.push('name');
        }
      }

      if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
        const existingSlug = await this.tenantsRepository.findOne({
          where: { slug: updateTenantDto.slug },
        });
        if (existingSlug && existingSlug.id !== id) {
          conflicts.push('slug');
        }
      }

      if (updateTenantDto.domain && updateTenantDto.domain !== tenant.domain) {
        const existingDomain = await this.tenantsRepository.findOne({
          where: { domain: updateTenantDto.domain },
        });
        if (existingDomain && existingDomain.id !== id) {
          conflicts.push('domain');
        }
      }

      if (conflicts.length > 0) {
        throw new ConflictException(
          `Tenant with this ${conflicts.join(', ')} already exists`,
        );
      }
    }

    Object.assign(tenant, updateTenantDto);
    return await this.tenantsRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantsRepository.remove(tenant);
  }

  async deactivate(id: string): Promise<Tenant> {
    return await this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<Tenant> {
    return await this.update(id, { isActive: true });
  }

  async getUserCount(tenantId: string): Promise<number> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${tenantId}" not found`);
    }

    return tenant.users?.length || 0;
  }

  async canAddUser(tenantId: string): Promise<boolean> {
    const tenant = await this.findOne(tenantId);

    if (!tenant.maxUsers) {
      return true; // No limit
    }

    const currentUserCount = await this.getUserCount(tenantId);
    return currentUserCount < tenant.maxUsers;
  }

  async updateSettings(
    id: string,
    settings: Record<string, any>,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.settings = {
      ...tenant.settings,
      ...settings,
    };

    return await this.tenantsRepository.save(tenant);
  }
}
