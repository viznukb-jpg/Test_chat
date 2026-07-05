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
import { Message } from '@/chat/entities/message.entity';
import { randomBytes } from 'crypto';
import { ChatGateway } from '@/chat/chat.gateway';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getUserRooms(userId: string) {
    const members = await this.roomMemberRepository.find({
      where: { userId },
      relations: { room: true },
    });
    return members.map((m) => ({
      ...m.room,
      role: m.role,
    }));
  }

  async getRoomMembers(userId: string, roomId: string) {
    await this.verifyOwnership(userId, roomId, false);

    return this.roomMemberRepository.find({
      where: { roomId },
      relations: { user: true },
      select: {
        id: true,
        role: true,
        mutedUntil: true,
        joinedAt: true,
        user: { id: true, username: true },
      },
    });
  }

  async getRoomMessages(userId: string, roomId: string) {
    await this.verifyOwnership(userId, roomId, false);

    return this.messageRepository.find({
      where: { roomId },
      relations: { sender: true },
      order: { createdAt: 'ASC' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: { id: true, username: true },
      },
    });
  }

  async createRoom(userId: string, title: string): Promise<Room> {
    let savedRoom: Room | null = null;
    let attempts = 0;

    while (!savedRoom && attempts < 5) {
      try {
        savedRoom = await this.roomRepository.manager.transaction(
          async (manager) => {
            const joinCode = randomBytes(4).toString('hex').toUpperCase();

            const room = manager.create(Room, {
              title,
              inviteCode: joinCode,
            });

            const saved = await manager.save(room);

            const ownerMember = manager.create(RoomMember, {
              userId,
              roomId: saved.id,
              role: RoomRole.OWNER,
            });

            await manager.save(ownerMember);

            return saved;
          },
        );
      } catch (error: unknown) {
        // Postgres Unique Constraint Violation code
        const isUniqueConstraint =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code: string }).code === '23505';

        if (isUniqueConstraint) {
          attempts++;
        } else {
          throw error;
        }
      }
    }

    if (!savedRoom) {
      throw new ConflictException('Failed to generate a unique invite code');
    }

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
    await this.verifyOwnership(ownerId, roomId, true);

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

    this.chatGateway.forceLeaveRoom(targetUserId, roomId);
    this.chatGateway.server.to(roomId).emit('userKicked', { targetUserId });

    return { success: true };
  }

  async muteUser(
    ownerId: string,
    roomId: string,
    targetUserId: string,
    durationMins: number,
  ) {
    await this.verifyOwnership(ownerId, roomId, true);

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

  async unmuteUser(ownerId: string, roomId: string, targetUserId: string) {
    await this.verifyOwnership(ownerId, roomId, true);

    const targetMember = await this.roomMemberRepository.findOne({
      where: { userId: targetUserId, roomId },
    });

    if (!targetMember) {
      throw new NotFoundException('Target user is not in this room');
    }

    targetMember.mutedUntil = null;
    await this.roomMemberRepository.save(targetMember);

    return { success: true };
  }

  async leaveRoom(userId: string, roomId: string) {
    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId },
    });

    if (!member) {
      throw new NotFoundException('You are not in this room');
    }

    if (member.role === RoomRole.OWNER) {
      throw new ForbiddenException(
        'Owners cannot leave the room. Please delete the room instead.',
      );
    }

    await this.roomMemberRepository.remove(member);
    return { success: true };
  }

  async deleteRoom(userId: string, roomId: string) {
    await this.verifyOwnership(userId, roomId, true);
    await this.roomRepository.delete(roomId);
    return { success: true };
  }

  private async verifyOwnership(
    userId: string,
    roomId: string,
    requireOwner: boolean,
  ) {
    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId },
    });

    if (!member) {
      throw new ForbiddenException('You are not in this room');
    }

    if (requireOwner && member.role !== RoomRole.OWNER) {
      throw new ForbiddenException('Only room owners can perform this action');
    }
  }
}
