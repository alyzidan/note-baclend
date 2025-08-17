import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  async create(
    createNoteDto: CreateNoteDto,
    userId: string,
    tenantId: string,
  ): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      tags: createNoteDto.tags || [],
      userId,
      tenantId,
    });

    return await this.notesRepository.save(note);
  }

  async findAll(
    tenantId: string,
    userId?: string,
    includeArchived: boolean = false,
  ): Promise<Note[]> {
    const query = this.notesRepository
      .createQueryBuilder('note')
      .where('note.tenantId = :tenantId', { tenantId });

    // If userId is provided, filter by user (for user-specific notes)
    if (userId) {
      query.andWhere('note.userId = :userId', { userId });
    }

    if (!includeArchived) {
      query.andWhere('note.isArchived = :isArchived', { isArchived: false });
    }

    return await query
      .leftJoinAndSelect('note.user', 'user')
      .orderBy('note.updatedAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, tenantId: string, userId?: string): Promise<Note> {
    const query = this.notesRepository
      .createQueryBuilder('note')
      .where('note.id = :id', { id })
      .andWhere('note.tenantId = :tenantId', { tenantId });

    // If userId is provided, ensure user can only access their own notes
    if (userId) {
      query.andWhere('note.userId = :userId', { userId });
    }

    const note = await query.leftJoinAndSelect('note.user', 'user').getOne();

    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    tenantId: string,
    userId?: string,
  ): Promise<Note> {
    const note = await this.findOne(id, tenantId, userId);

    // Additional check to ensure user can only update their own notes
    if (userId && note.userId !== userId) {
      throw new ForbiddenException('You can only update your own notes');
    }

    Object.assign(note, updateNoteDto);

    return await this.notesRepository.save(note);
  }

  async remove(id: string, tenantId: string, userId?: string): Promise<void> {
    const note = await this.findOne(id, tenantId, userId);

    // Additional check to ensure user can only delete their own notes
    if (userId && note.userId !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.notesRepository.remove(note);
  }

  async archive(id: string, tenantId: string, userId?: string): Promise<Note> {
    return await this.update(id, { isArchived: true }, tenantId, userId);
  }

  async unarchive(
    id: string,
    tenantId: string,
    userId?: string,
  ): Promise<Note> {
    return await this.update(id, { isArchived: false }, tenantId, userId);
  }

  async findByTag(
    tag: string,
    tenantId: string,
    userId?: string,
  ): Promise<Note[]> {
    const query = this.notesRepository
      .createQueryBuilder('note')
      .where(':tag = ANY(note.tags)', { tag })
      .andWhere('note.tenantId = :tenantId', { tenantId })
      .andWhere('note.isArchived = :isArchived', { isArchived: false });

    // If userId is provided, filter by user
    if (userId) {
      query.andWhere('note.userId = :userId', { userId });
    }

    return await query
      .leftJoinAndSelect('note.user', 'user')
      .orderBy('note.updatedAt', 'DESC')
      .getMany();
  }

  async findByUser(userId: string, tenantId: string): Promise<Note[]> {
    return await this.findAll(tenantId, userId);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return await this.notesRepository.count({
      where: { tenantId },
    });
  }

  async countByUser(userId: string, tenantId: string): Promise<number> {
    return await this.notesRepository.count({
      where: { userId, tenantId },
    });
  }

  // Admin methods (for tenant admins to see all notes in their tenant)
  async findAllInTenant(
    tenantId: string,
    includeArchived: boolean = false,
  ): Promise<Note[]> {
    return await this.findAll(tenantId, undefined, includeArchived);
  }

  async getTenantStatistics(tenantId: string): Promise<{
    totalNotes: number;
    activeNotes: number;
    archivedNotes: number;
    notesByUser: Array<{ userId: string; userName: string; noteCount: number }>;
  }> {
    const totalNotes = await this.notesRepository.count({
      where: { tenantId },
    });

    const activeNotes = await this.notesRepository.count({
      where: { tenantId, isArchived: false },
    });

    const archivedNotes = await this.notesRepository.count({
      where: { tenantId, isArchived: true },
    });

    // Get notes count by user
    const notesByUser = await this.notesRepository
      .createQueryBuilder('note')
      .select('note.userId', 'userId')
      .addSelect("user.firstName || ' ' || user.lastName", 'userName')
      .addSelect('COUNT(*)', 'noteCount')
      .leftJoin('note.user', 'user')
      .where('note.tenantId = :tenantId', { tenantId })
      .groupBy('note.userId')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .getRawMany();

    return {
      totalNotes,
      activeNotes,
      archivedNotes,
      notesByUser: notesByUser.map((item) => ({
        userId: item.userId,
        userName: item.userName,
        noteCount: parseInt(item.noteCount),
      })),
    };
  }
}
