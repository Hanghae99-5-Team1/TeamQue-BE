import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class DateDto {
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @IsInt()
  day: number;
}
