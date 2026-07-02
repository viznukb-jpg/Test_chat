import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { Message } from './entities/message.entity';
import { RoomMember } from '@/rooms/entities/room-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, RoomMember]),
    JwtModule.register({}),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
