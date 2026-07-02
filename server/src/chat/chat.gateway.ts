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
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { RoomMember } from '@/rooms/entities/room-member.entity';

@WebSocketGateway({ cors: { origin: '*' } })
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

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers['authorization']?.split(' ')[1];
        
      if (!token) {
        throw new WsException('No token provided');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'super-secret',
      });
      const userId = payload.sub;

      const session = await this.redisService.get(`auth:sessions:${userId}`);
      if (!session) {
        throw new WsException('Session expired or revoked');
      }

      
      client.data.userId = userId;
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('roomId') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId },
    });

    if (!member) {
      throw new WsException('You are not a member of this room');
    }

    client.join(roomId);
    return { event: 'joinedRoom', data: roomId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId: data.roomId },
      relations: { user: true },
    });

    if (!member) {
      throw new WsException('You are not a member of this room');
    }

    
    if (member.mutedUntil && member.mutedUntil > new Date()) {
      throw new WsException(`You are muted until ${member.mutedUntil.toISOString()}`);
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
