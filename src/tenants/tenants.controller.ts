import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(AdminGuard) // Only system admins can create tenants
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: 201,
    description: 'The tenant has been successfully created.',
    type: Tenant,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Tenant with name/slug/domain already exists.',
  })
  create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(AdminGuard) // Only system admins can list all tenants
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive tenants in the results',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tenants retrieved successfully.',
    type: [Tenant],
  })
  findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<Tenant[]> {
    const include = includeInactive === 'true';
    return this.tenantsService.findAll(include);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a tenant by slug' })
  @ApiParam({
    name: 'slug',
    description: 'The unique slug of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been found.',
    type: Tenant,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  findBySlug(@Param('slug') slug: string): Promise<Tenant> {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been found.',
    type: Tenant,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  findOne(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard) // Only system admins can update tenant details
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been successfully updated.',
    type: Tenant,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Tenant with name/slug/domain already exists.',
  })
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant settings updated successfully.',
    type: Tenant,
  })
  updateSettings(
    @Param('id') id: string,
    @Body() settings: Record<string, any>,
  ): Promise<Tenant> {
    return this.tenantsService.updateSettings(id, settings);
  }

  @Patch(':id/deactivate')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Deactivate a tenant' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been deactivated.',
    type: Tenant,
  })
  deactivate(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.deactivate(id);
  }

  @Patch(':id/activate')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Activate a tenant' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'The tenant has been activated.',
    type: Tenant,
  })
  activate(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.activate(id);
  }

  @Get(':id/users/count')
  @ApiOperation({ summary: 'Get user count for a tenant' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'User count retrieved successfully.',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getUserCount(@Param('id') id: string): Promise<{ count: number }> {
    const count = await this.tenantsService.getUserCount(id);
    return { count };
  }

  @Delete(':id')
  @UseGuards(AdminGuard) // Only system admins can delete tenants
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the tenant',
  })
  @ApiResponse({
    status: 204,
    description: 'The tenant has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.tenantsService.remove(id);
  }
}
