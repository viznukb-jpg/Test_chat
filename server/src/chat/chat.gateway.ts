import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { RoomMember } from '@/rooms/entities/room-member.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import * as cookieModule from 'cookie';

@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // 1. Extract token: try cookie first, then handshake auth, then header
      let token: string | undefined;

      const rawCookie = client.handshake.headers.cookie;
      if (rawCookie) {
        const parsed = cookieModule.parse(rawCookie);
        token = parsed.accessToken;
      }

      if (!token) {
        token =
          (client.handshake.auth.token as string) ||
          client.handshake.headers['authorization']?.split(' ')[1];
      }

      if (!token) {
        throw new WsException('No token provided');
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') || 'super-secret',
      });
      const userId = String(payload.sub);

      // 2. Compare token with Redis (same logic as JWT strategy)
      const storedToken = await this.redisService.get(
        `auth:sessions:${userId}`,
      );
      if (!storedToken || storedToken !== token) {
        throw new WsException('Session expired or revoked');
      }

      client.data.userId = userId;
    } catch {
      client.emit('exception', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect() {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.data?.userId;
    if (!userId) {
      throw new WsException('Not authenticated');
    }

    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId: data.roomId },
    });

    if (!member) {
      throw new WsException('You are not a member of this room');
    }

    void client.join(data.roomId);
    return { event: 'joinedRoom', data: data.roomId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const userId = client.data?.userId;
    if (!userId) {
      throw new WsException('Not authenticated');
    }

    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId: data.roomId },
      relations: { user: true },
    });

    if (!member) {
      throw new WsException('You are not a member of this room');
    }

    if (member.mutedUntil && member.mutedUntil > new Date()) {
      throw new WsException(
        `You are muted until ${member.mutedUntil.toISOString()}`,
      );
    }

    const message = this.messageRepository.create({
      content: data.content,
      senderId: userId,
      roomId: data.roomId,
    });
    const savedMessage = await this.messageRepository.save(message);

    const payload = {
      id: savedMessage.id,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt,
      roomId: savedMessage.roomId,
      sender: {
        id: member.user.id,
        username: member.user.username,
      },
    };

    this.server.to(data.roomId).emit('newMessage', payload);

    return payload;
  }
}
