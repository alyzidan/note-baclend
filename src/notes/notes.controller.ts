import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() dto: CreateNoteDto, @Req() req: any) {
    return this.notesService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any, @Query('includeArchived') includeArchived?: string) {
    const include = includeArchived === 'true';
    return this.notesService.findAll(req.user.userId, include);
  }

  @Get('by-tag/:tag')
  findByTag(@Param('tag') tag: string, @Req() req: any) {
    return this.notesService.findByTag(tag, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.notesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() req: any,
  ) {
    return this.notesService.update(id, updateNoteDto, req.user.userId);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @Req() req: any) {
    return this.notesService.archive(id, req.user.userId);
  }

  @Post(':id/unarchive')
  unarchive(@Param('id') id: string, @Req() req: any) {
    return this.notesService.unarchive(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.notesService.remove(id, req.user.userId);
  }
}
