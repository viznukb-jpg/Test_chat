import { IsNumber, Min } from 'class-validator';

export class MuteUserDto {
  @IsNumber()
  @Min(1)
  durationMins!: number;
}
