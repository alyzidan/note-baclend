import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      tags: createNoteDto.tags || [],
    });

    return await this.notesRepository.save(note);
  }

  async findAll(includeArchived: boolean = false): Promise<Note[]> {
    const query = this.notesRepository.createQueryBuilder('note');

    if (!includeArchived) {
      query.where('note.isArchived = :isArchived', { isArchived: false });
    }

    return await query.orderBy('note.updatedAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);

    Object.assign(note, updateNoteDto);

    return await this.notesRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.notesRepository.remove(note);
  }

  async archive(id: string): Promise<Note> {
    return await this.update(id, { isArchived: true });
  }

  async unarchive(id: string): Promise<Note> {
    return await this.update(id, { isArchived: false });
  }

  async findByTag(tag: string): Promise<Note[]> {
    return await this.notesRepository
      .createQueryBuilder('note')
      .where(':tag = ANY(note.tags)', { tag })
      .andWhere('note.isArchived = :isArchived', { isArchived: false })
      .orderBy('note.updatedAt', 'DESC')
      .getMany();
  }
}
