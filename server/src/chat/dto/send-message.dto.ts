import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}
