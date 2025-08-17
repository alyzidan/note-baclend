import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateTenantDto {
  @ApiProperty({
    description: 'The name of the tenant/organization',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description:
      'Unique slug for the tenant (lowercase, alphanumeric with dashes)',
    example: 'acme-corp',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and dashes',
  })
  @Transform(({ value }) => value.toLowerCase())
  slug: string;

  @ApiPropertyOptional({
    description: 'Domain associated with the tenant',
    example: 'acme.com',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({
    description: 'Tenant configuration settings',
    example: { theme: 'dark', features: ['notes', 'collaboration'] },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the tenant is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of users allowed for this tenant',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'Maximum storage in bytes allowed for this tenant',
    example: 1073741824,
  })
  @IsOptional()
  @IsNumber()
  maxStorage?: number;

  @ApiPropertyOptional({
    description: 'Tenant subscription plan',
    example: 'premium',
    default: 'free',
  })
  @IsOptional()
  @IsString()
  plan?: string;
}
