import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.usersService.findByUsername(email);
    if (exists) throw new UnauthorizedException('Username already taken');

    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({ email, password: hash });
      return this.login({ id: user.id, email: user.email });
    } catch (error: any) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  async validate(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    return { id: user.id, email: user.email };
  }

  login(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload) };
  }
}
