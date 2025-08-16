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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Tenant } from '../tenants/entities/tenants.entity';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
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
  create(
    @Body() createNoteDto: CreateNoteDto,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note> {
    return this.notesService.create(createNoteDto, req.user.id, tenant.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for the current user' })
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
  findAll(
    @Query('includeArchived') includeArchived: string,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note[]> {
    const include = includeArchived === 'true';
    return this.notesService.findAll(tenant.id, req.user.id, include);
  }

  @Get('tenant/all')
  @UseGuards(AdminGuard) // Only tenant admins can see all notes in tenant
  @ApiOperation({ summary: 'Get all notes in the tenant (admin only)' })
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Include archived notes in the results',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all tenant notes retrieved successfully.',
    type: [Note],
  })
  findAllInTenant(
    @Query('includeArchived') includeArchived: string,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note[]> {
    const include = includeArchived === 'true';
    return this.notesService.findAllInTenant(tenant.id, include);
  }

  @Get('tenant/statistics')
  @UseGuards(AdminGuard) // Only tenant admins can see statistics
  @ApiOperation({ summary: 'Get tenant note statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant statistics retrieved successfully.',
  })
  getTenantStatistics(@CurrentTenant() tenant: Tenant) {
    return this.notesService.getTenantStatistics(tenant.id);
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Get notes by tag for the current user' })
  @ApiParam({
    name: 'tag',
    description: 'The tag to filter notes by',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes with the specified tag.',
    type: [Note],
  })
  findByTag(
    @Param('tag') tag: string,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note[]> {
    return this.notesService.findByTag(tag, tenant.id, req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(AdminGuard) // Only tenant admins can see other users' notes
  @ApiOperation({ summary: 'Get notes by user ID (admin only)' })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user whose notes to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes for the specified user.',
    type: [Note],
  })
  findByUser(
    @Param('userId') userId: string,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note[]> {
    return this.notesService.findByUser(userId, tenant.id);
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
  findOne(
    @Param('id') id: string,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note> {
    return this.notesService.findOne(id, tenant.id, req.user.id);
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You can only update your own notes.',
  })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDto, tenant.id, req.user.id);
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
  archive(
    @Param('id') id: string,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note> {
    return this.notesService.archive(id, tenant.id, req.user.id);
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
  unarchive(
    @Param('id') id: string,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<Note> {
    return this.notesService.unarchive(id, tenant.id, req.user.id);
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You can only delete your own notes.',
  })
  remove(
    @Param('id') id: string,
    @Request() req,
    @CurrentTenant() tenant: Tenant,
  ): Promise<void> {
    return this.notesService.remove(id, tenant.id, req.user.id);
  }
}
