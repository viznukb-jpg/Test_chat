import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Room } from '@/rooms/entities/room.entity';

export enum RoomRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

@Entity('room_members')
@Index(['userId', 'roomId'], { unique: true })
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: RoomRole,
    default: RoomRole.MEMBER,
  })
  role!: RoomRole;

  @Column({ type: 'timestamp', nullable: true })
  mutedUntil!: Date | null;

  @ManyToOne(() => User, (user: User) => user.roomMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Room, (room: Room) => room.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column()
  roomId!: string;

  @CreateDateColumn()
  joinedAt!: Date;
}
