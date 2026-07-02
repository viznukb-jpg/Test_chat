import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomMember, RoomRole } from './entities/room-member.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
  ) {}

  async createRoom(userId: string, title: string): Promise<Room> {
    const joinCode = randomBytes(4).toString('hex').toUpperCase();

    const room = this.roomRepository.create({
      title,
      inviteCode: joinCode,
    });

    const savedRoom = await this.roomRepository.save(room);

    const ownerMember = this.roomMemberRepository.create({
      userId,
      roomId: savedRoom.id,
      role: RoomRole.OWNER,
    });

    await this.roomMemberRepository.save(ownerMember);

    return savedRoom;
  }

  async joinRoom(userId: string, joinCode: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { inviteCode: joinCode },
    });

    if (!room) {
      throw new NotFoundException('Room with this invite code not found');
    }

    const existingMember = await this.roomMemberRepository.findOne({
      where: { userId, roomId: room.id },
    });

    if (existingMember) {
      throw new ConflictException('You are already a member of this room');
    }

    const newMember = this.roomMemberRepository.create({
      userId,
      roomId: room.id,
      role: RoomRole.MEMBER,
    });

    await this.roomMemberRepository.save(newMember);

    return room;
  }

  async kickUser(ownerId: string, roomId: string, targetUserId: string) {
    await this.verifyOwnership(ownerId, roomId);

    const targetMember = await this.roomMemberRepository.findOne({
      where: { userId: targetUserId, roomId },
    });

    if (!targetMember) {
      throw new NotFoundException('Target user is not in this room');
    }

    if (targetMember.role === RoomRole.OWNER) {
      throw new ForbiddenException('Cannot kick another owner');
    }

    await this.roomMemberRepository.remove(targetMember);
    return { success: true };
  }

  async muteUser(
    ownerId: string,
    roomId: string,
    targetUserId: string,
    durationMins: number,
  ) {
    await this.verifyOwnership(ownerId, roomId);

    const targetMember = await this.roomMemberRepository.findOne({
      where: { userId: targetUserId, roomId },
    });

    if (!targetMember) {
      throw new NotFoundException('Target user is not in this room');
    }

    if (targetMember.role === RoomRole.OWNER) {
      throw new ForbiddenException('Cannot mute another owner');
    }

    const mutedUntil = new Date();
    mutedUntil.setMinutes(mutedUntil.getMinutes() + durationMins);

    targetMember.mutedUntil = mutedUntil;
    await this.roomMemberRepository.save(targetMember);

    return { success: true, mutedUntil };
  }

  private async verifyOwnership(userId: string, roomId: string) {
    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId },
    });

    if (!member) {
      throw new ForbiddenException('You are not in this room');
    }

    if (member.role !== RoomRole.OWNER) {
      throw new ForbiddenException('Only room owners can perform this action');
    }
  }
}
