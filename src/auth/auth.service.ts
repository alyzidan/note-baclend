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

  //   async register(email: string, password: string) {
  //     const exists = await this.usersService.findByUsername(email);
  //     if (exists) throw new UnauthorizedException('Username already taken');

  //     try {
  //       const hash = await bcrypt.hash(password, 10);
  //       const user = await this.usersService.create({ email, password: hash });
  //       return this.login({ id: user.id, email: user.email });
  //     } catch (error: any) {
  //       throw new Error(`Failed to hash password: ${error.message}`);
  //     }
  //   }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    tenantId: string,
  ) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new UnauthorizedException('Email already taken');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hash,
      firstName,
      lastName,
      tenantId,
    });

    return this.login({
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });
  }
  async validate(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;

    return { id: user.id, email: user.email, tenantId: user.tenantId };
  }

  login(user: { id: string; email: string; tenantId: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
    return { access_token: this.jwt.sign(payload), tenantId: user.tenantId };
  }

  //   async validate(email: string, pass: string) {
  //     const user = await this.usersService.findByUsername(email);
  //     if (!user) return null;
  //     const ok = await bcrypt.compare(pass, user.password);
  //     if (!ok) return null;
  //     return { id: user.id, email: user.email };
  //   }

  //   login(user: { id: string; email: string; tenant_id: string }) {
  //     const payload = {
  //       sub: user.id,
  //       email: user.email,
  //       tenant_id: user.tenant_id,
  //     };
  //     return { access_token: this.jwt.sign(payload), tenant_id: user.tenant_id };
  //   }
}
