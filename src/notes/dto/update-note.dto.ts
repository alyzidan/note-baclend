import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiPropertyOptional({
    description: 'Whether the note should be archived',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
