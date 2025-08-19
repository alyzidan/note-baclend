import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotesModule } from './notes/notes.module';
import { DatabaseModule } from './database/database.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    NotesModule,
    AuthModule,
    TenantsModule,
  ],
  providers: [
    UsersService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  controllers: [UsersController],
})
export class AppModule {}
