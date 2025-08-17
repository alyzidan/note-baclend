import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantGuard } from '../common/guards/tenant.guard';
@Module({
  imports: [TypeOrmModule.forFeature([Note]), UsersModule, TenantsModule],
  controllers: [NotesController],
  providers: [NotesService, TenantGuard],
  exports: [TypeOrmModule],
})
export class NotesModule {}
