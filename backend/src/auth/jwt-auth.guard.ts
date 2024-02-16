import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<User>(_: any, user: User): User {
    return user;
  }
}

export function JwtAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
