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

  async register(username: string, password: string) {
    const exists = await this.usersService.findByUsername(username);
    if (exists) throw new UnauthorizedException('Username already taken');

    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({ username, password: hash });
      return this.login({ id: user.id, username: user.username });
    } catch (error: any) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  async validate(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    return { id: user.id, username: user.username };
  }

  login(user: { id: string; username: string }) {
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwt.sign(payload) };
  }
}
