import { Module } from '@nestjs/common';
import { WebsocketServer } from './websocket.gateway';

@Module({ providers: [WebsocketServer] })
export class GatewayModule {}
