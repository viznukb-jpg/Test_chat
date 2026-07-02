import {
  Controller,
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

@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(@Req() req: any, @Body('title') title: string) {
    return this.roomsService.createRoom(req.user.userId, title);
  }

  @Post('join')
  async joinRoom(@Req() req: any, @Body('joinCode') joinCode: string) {
    return this.roomsService.joinRoom(req.user.userId, joinCode);
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
    @Body('durationMins') durationMins: number,
  ) {
    return this.roomsService.muteUser(
      req.user.userId,
      roomId,
      targetUserId,
      durationMins,
    );
  }
}
