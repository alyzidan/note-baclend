import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Tenant } from '../../tenants/entities/tenants.entity';
import { Note } from '../../notes/entities/note.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'The unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    description: 'The age of the user',
    example: 20,
  })
  @Column()
  age: number;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @Column()
  lastName: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({
    description: 'The role of the user within their tenant',
    example: 'user',
    enum: ['user', 'admin', 'super_admin'],
  })
  @Column({ default: 'user' })
  role: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'When the user last logged in',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'The tenant ID this user belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ApiProperty({
    description: 'When the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  deleteddAt: Date;

  @ApiProperty({
    description: 'When the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  // Virtual properties
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
