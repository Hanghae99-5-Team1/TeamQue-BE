import { IsInt, IsString } from 'class-validator';

export class DateDto {
  @IsString({ message: '시작시간을 입력해주세요' })
  startTime: string;

  @IsString({ message: '종료시간을 입력해주세요' })
  endTime: string;

  @IsInt({ message: '요일을 입력해주세요' })
  day: number;
}
