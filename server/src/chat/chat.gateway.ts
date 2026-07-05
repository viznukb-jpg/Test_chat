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

  private userSockets = new Map<string, Set<string>>();
  private async checkRateLimit(userId: string): Promise<boolean> {
    const key = `rate_limit:chat:${userId}`;
    const pipeline = this.redisService.multi();
    pipeline.incr(key);
    // Setting expiration to 10 seconds only if it's a new key (technically incr will make it 1, so we check if we should set expire, but standard practice is just multi with EXPIRE since EXPIRE resets ttl. Wait, if we use a fixed 10s window, EXPIRE 10 on first hit is better. But INCR + EXPIRE 10 on every hit is simple enough, it means a sliding window of inactivity. If we want fixed 10s window, we can use an lua script, or just get and incr)

    const current = await this.redisService.get(key);
    if (current && parseInt(current, 10) >= 15) {
      return false;
    }

    if (!current) {
      pipeline.expire(key, 10);
    }
    await pipeline.exec();
    return true;
  }

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

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      if (!secret) {
        throw new WsException('JWT_ACCESS_SECRET is not defined');
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret,
      });
      const userId = String(payload.sub);

      const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new WsException('Token revoked');
      }

      client.data.userId = userId;
      void client.join(`user:${userId}`);
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
    } catch {
      client.emit('exception', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.userId;
    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    sockets?.delete(client.id);

    if (!sockets || sockets.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  forceLeaveRoom(userId: string, roomId: string) {
    this.server.in(`user:${userId}`).socketsLeave(roomId);
  }

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

    if (!(await this.checkRateLimit(userId))) {
      throw new WsException(
        'Rate limit exceeded. Please wait before sending more messages.',
      );
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
