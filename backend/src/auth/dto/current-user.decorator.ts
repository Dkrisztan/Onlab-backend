import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtUserDto } from 'src/auth/dto/jwtUser.dto';
import { User } from '../../user/entities/user.entity';

type AnyUser = User | JwtUserDto;

export const CurrentUser = createParamDecorator<keyof AnyUser | undefined>(
  (key, context: ExecutionContext) => {
    const user: AnyUser = context.switchToHttp().getRequest().user;

    if (!user) {
      throw new InternalServerErrorException(
        'CurrentUser decorator invoked without authGuard',
      );
    }

    if (key && !user.hasOwnProperty(key)) {
      throw new InternalServerErrorException(
        `Unknown key ${key} in CurrentUser decorator`,
      );
    }

    return key ? user[key] : user;
  },
);

export const CurrentUserOptional = createParamDecorator<
  keyof AnyUser | undefined
>((key, context: ExecutionContext) => {
  const user: AnyUser = context.switchToHttp().getRequest().user;
  if (key && !user?.hasOwnProperty(key)) {
    throw new InternalServerErrorException(
      `Unknown key ${key} in CurrentUser decorator`,
    );
  }

  return key ? user[key] : user;
});
