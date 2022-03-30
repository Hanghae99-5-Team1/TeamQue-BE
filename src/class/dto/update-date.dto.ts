import { IsInt, IsString } from 'class-validator';

export class UpdateDateDto {
  @IsInt({ message: '년도를 입력해주세요' })
  year: number;

  @IsInt({ message: '달을 입력해주세요' })
  month: number;

  @IsInt({ message: '날짜를 입력해주세요' })
  day: number;

  @IsString({ message: '시작시간을 입력해주세요' })
  startTime: string;

  @IsString({ message: '종료시간을 입력해주세요' })
  endTime: string;
}
