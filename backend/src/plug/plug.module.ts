import { Module } from '@nestjs/common';
import { PlugService } from './plug.service';
import { PlugController } from './plug.controller';

@Module({
  controllers: [PlugController],
  providers: [PlugService],
})
export class PlugModule {}
