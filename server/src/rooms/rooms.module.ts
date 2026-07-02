import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { Message } from '@/chat/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember, Message])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
