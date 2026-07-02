import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Delete,
  Patch,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { MuteUserDto } from './dto/mute-user.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getMyRooms(@Req() req: any) {
    return this.roomsService.getUserRooms(req.user.userId);
  }

  @Post()
  async createRoom(@Req() req: any, @Body() body: CreateRoomDto) {
    return this.roomsService.createRoom(req.user.userId, body.title);
  }

  @Post('join')
  async joinRoom(@Req() req: any, @Body() body: JoinRoomDto) {
    return this.roomsService.joinRoom(req.user.userId, body.joinCode);
  }

  @Get(':roomId/members')
  async getRoomMembers(@Req() req: any, @Param('roomId') roomId: string) {
    return this.roomsService.getRoomMembers(req.user.userId, roomId);
  }

  @Get(':roomId/messages')
  async getRoomMessages(@Req() req: any, @Param('roomId') roomId: string) {
    return this.roomsService.getRoomMessages(req.user.userId, roomId);
  }

  @Delete(':roomId/members/:targetUserId')
  async kickUser(
    @Req() req: any,
    @Param('roomId') roomId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.roomsService.kickUser(req.user.userId, roomId, targetUserId);
  }

  @Patch(':roomId/members/:targetUserId/mute')
  async muteUser(
    @Req() req: any,
    @Param('roomId') roomId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body: MuteUserDto,
  ) {
    return this.roomsService.muteUser(
      req.user.userId,
      roomId,
      targetUserId,
      body.durationMins,
    );
  }
}
