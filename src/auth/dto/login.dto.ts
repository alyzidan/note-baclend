import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@tenant.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongP@ssw0rd' })
  @IsString()
  password: string;
}
