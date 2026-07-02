import { IsString, Length } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @Length(4, 12)
  joinCode!: string;
}
