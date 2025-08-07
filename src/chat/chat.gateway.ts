// src/chat/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from '../auth/constants';
import { UserService } from '../user/user.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || jwtConstants.secret);
      client.data.user = decoded;
      console.log('✅ WebSocket Authenticated');
    } catch (err) {
      console.log('❌ WebSocket Unauthorized');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Disconnected');
  }

  afterInit() {
    console.log('🚀 WebSocket Gateway Initialized');
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { appointmentId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.appointmentId);
    client.emit('roomJoined', data.appointmentId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: { appointmentId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.data.user;
const senderId = sender.userId || sender.sub || sender._id || sender.id;
    console.log('📩 Message from:', senderId, 'to:', data.receiverId);

    const saved = await this.chatService.saveMessage({
      appointmentId: data.appointmentId,
      senderId: senderId,
      receiverId: data.receiverId,
      content: data.content,
    });

    const senderInfo = await this.userService.findOne(senderId);

    const messagePayload = {
      _id: saved._id,
      appointmentId: saved.appointmentId,
      senderId: senderId,
      receiverId: saved.receiverId,
      content: saved.content,
      createdAt: saved.createdAt,
      isSeen: saved.isSeen,
      senderEmail: senderInfo?.email || null,
    };

    this.server.to(data.appointmentId).emit('receiveMessage', messagePayload);
    this.server.to(data.appointmentId).emit('newMessageNotify', {
      appointmentId: data.appointmentId,
      senderEmail: messagePayload.senderEmail,
    });
  }

  @SubscribeMessage('markSeen')
  async handleMarkSeen(
    @MessageBody() data: { appointmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    await this.chatService.markAsSeen(data.appointmentId, user.userId);
  }
}
