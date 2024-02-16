import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'nestjs-prisma';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';

export const secretJwt = process.env.JWT_ACCESSTOKEN_SECRET;

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: secretJwt,
      signOptions: { expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRES_IN }, // e.g. 30s, 7d, 24h
    }),
    UserModule,
  ],
})
export class AuthModule {}
