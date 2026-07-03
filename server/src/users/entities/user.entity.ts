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
import { RefreshToken } from '@/auth/entities/refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: false })
  username!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => RoomMember, (roomMember: RoomMember) => roomMember.user)
  roomMembers!: RoomMember[];

  @OneToMany(() => Message, (message: Message) => message.sender)
  messages!: Message[];

  @OneToMany(
    () => RefreshToken,
    (refreshToken: RefreshToken) => refreshToken.user,
  )
  refreshTokens!: RefreshToken[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
