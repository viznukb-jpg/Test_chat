import { IsNumber, Min, Max } from 'class-validator';

export class MuteUserDto {
  @IsNumber()
  @Min(5)
  @Max(60)
  durationMins!: number;
}
