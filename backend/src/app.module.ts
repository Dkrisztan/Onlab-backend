import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { GatewayModule } from './gateway/gateway.module';
import { PlugModule } from './plug/plug.module';

@Module({
  imports: [UserModule, PrismaModule.forRoot({ isGlobal: true }), AuthModule, GatewayModule, PlugModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
