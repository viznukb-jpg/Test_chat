import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoomMember } from '@/rooms/entities/room-member.entity';
import { Message } from '@/chat/entities/message.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  inviteCode!: string;

  @OneToMany(() => RoomMember, (roomMember: RoomMember) => roomMember.room)
  members!: RoomMember[];

  @OneToMany(() => Message, (message: Message) => message.room)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
