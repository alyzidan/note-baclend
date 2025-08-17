import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.tenantId,
    );
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validate(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.auth.login(user);
  }
}
