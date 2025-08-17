import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Note } from '../../notes/entities/note.entity';

@Entity('tenants')
export class Tenant {
  @ApiProperty({
    description: 'The unique identifier for the tenant',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The name of the tenant/organization',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @Column({ length: 255, unique: true })
  name: string;

  @ApiProperty({
    description: 'Unique slug for the tenant (used in URLs)',
    example: 'acme-corp',
    maxLength: 100,
  })
  @Column({ length: 100, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Domain associated with the tenant',
    example: 'acme.com',
    required: false,
  })
  @Column({ nullable: true })
  domain?: string;

  @ApiProperty({
    description: 'Tenant configuration settings',
    example: { theme: 'dark', features: ['notes', 'collaboration'] },
  })
  @Column('jsonb', { default: {} })
  settings: Record<string, any>;

  @ApiProperty({
    description: 'Whether the tenant is active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Maximum number of users allowed for this tenant',
    example: 100,
    required: false,
  })
  @Column({ nullable: true })
  maxUsers?: number;

  @ApiProperty({
    description: 'Maximum storage in bytes allowed for this tenant',
    example: 1073741824,
    required: false,
  })
  @Column('bigint', { nullable: true })
  maxStorage?: number;

  @ApiProperty({
    description: 'Tenant subscription plan',
    example: 'premium',
    default: 'free',
  })
  @Column({ default: 'free' })
  plan: string;

  @ApiProperty({
    description: 'When the tenant was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the tenant was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Note, (note) => note.tenant)
  notes: Note[];
}
