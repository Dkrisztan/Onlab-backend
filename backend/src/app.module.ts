import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [UserModule, PrismaModule.forRoot({ isGlobal: true }), AuthModule, GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
