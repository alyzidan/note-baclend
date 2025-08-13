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
import { UsersService } from '../users/users.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    private readonly usersService: UsersService,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const user = await this.usersService.findOne(userId);
    const note = this.noteRepository.create({
      ...createNoteDto,
      tags: createNoteDto.tags ?? [],
      user,
    });
    return this.noteRepository.save(note);
  }

  async findAll(userId: string, includeArchived = false): Promise<Note[]> {
    const qb = this.noteRepository
      .createQueryBuilder('note')
      .leftJoin('note.user', 'user')
      .where('user.id = :userId', { userId });

    if (!includeArchived) {
      qb.andWhere('note.isArchived = :isArchived', { isArchived: false });
    }

    return qb.orderBy('note.updatedAt', 'DESC').getMany();
  }

  async findByTag(tag: string, userId: string): Promise<Note[]> {
    return this.noteRepository
      .createQueryBuilder('note')
      .leftJoin('note.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere(':tag = ANY(note.tags)', { tag })
      .andWhere('note.isArchived = :isArchived', { isArchived: false })
      .orderBy('note.updatedAt', 'DESC')
      .getMany();
  }

  private async findOwnedOrThrow(id: string, userId: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!note) throw new NotFoundException(`Note with ID "${id}" not found`);
    if (note.user.id !== userId) throw new ForbiddenException('Not your note');
    return note;
  }

  async findOne(id: string, userId: string): Promise<Note> {
    return this.findOwnedOrThrow(id, userId);
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    const note = await this.findOwnedOrThrow(id, userId);
    Object.assign(note, updateNoteDto);
    return this.noteRepository.save(note);
  }

  async archive(id: string, userId: string): Promise<Note> {
    return this.update(id, { isArchived: true }, userId);
  }

  async unarchive(id: string, userId: string): Promise<Note> {
    return this.update(id, { isArchived: false }, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOwnedOrThrow(id, userId);
    await this.noteRepository.remove(note);
  }
}
