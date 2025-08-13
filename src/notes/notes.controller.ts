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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
    type: Note,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation failed.',
  })
  create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes' })
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Include archived notes in the results',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes retrieved successfully.',
    type: [Note],
  })
  findAll(@Query('includeArchived') includeArchived?: string): Promise<Note[]> {
    const include = includeArchived === 'true';
    return this.notesService.findAll(include);
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Get notes by tag' })
  @ApiParam({
    name: 'tag',
    description: 'The tag to filter notes by',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes with the specified tag.',
    type: [Note],
  })
  findByTag(@Param('tag') tag: string): Promise<Note[]> {
    return this.notesService.findByTag(tag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the note',
  })
  @ApiResponse({
    status: 200,
    description: 'The note has been found.',
    type: Note,
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found.',
  })
  findOne(@Param('id') id: string): Promise<Note> {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the note',
  })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully updated.',
    type: Note,
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a note' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the note',
  })
  @ApiResponse({
    status: 200,
    description: 'The note has been archived.',
    type: Note,
  })
  archive(@Param('id') id: string): Promise<Note> {
    return this.notesService.archive(id);
  }

  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a note' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the note',
  })
  @ApiResponse({
    status: 200,
    description: 'The note has been unarchived.',
    type: Note,
  })
  unarchive(@Param('id') id: string): Promise<Note> {
    return this.notesService.unarchive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the note',
  })
  @ApiResponse({
    status: 204,
    description: 'The note has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.notesService.remove(id);
  }
}
