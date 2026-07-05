import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title!: string;
}
