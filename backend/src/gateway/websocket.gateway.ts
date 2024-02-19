import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'], // frontend port, vite in this example
  },
})
export class WebsocketServer
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sensorData')
  handleSensorData(client: any, data: any[]) {
    const [message, room] = data;

    // saving the data to a database
    // console.log(JSON.stringify(message) + '\n');

    // sending the data forwards to the frontend
    client.to(room).emit('frontendData', message.consumption);

    // logging the data (not necessary)
    console.log(message);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: any, room: string) {
    client.join(room);
  }
}
