import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notes')
export class Note {
  @ApiProperty({
    description: 'The unique identifier for the note',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The title of the note',
    example: 'My Important Note',
    maxLength: 255,
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    description: 'The content of the note',
    example: 'This is the detailed content of my note...',
  })
  @Column('text')
  content: string;

  @ApiProperty({
    description: 'Optional tags for categorizing the note',
    example: ['work', 'important', 'project'],
    required: false,
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({
    description: 'Whether the note is archived',
    example: false,
    default: false,
  })
  @Column({ default: false })
  isArchived: boolean;

  @ApiProperty({
    description: 'When the note was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'When the note was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
