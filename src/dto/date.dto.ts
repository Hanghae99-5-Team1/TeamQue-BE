import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class DateDto {
  @IsString({ message: '시작시간을 입력해주세요' })
  @ApiProperty({ type: String, description: '시작시간', example: '12:00' })
  startTime: string;

  @IsString({ message: '종료시간을 입력해주세요' })
  @ApiProperty({ type: String, description: '종료시간', example: '15:00' })
  endTime: string;

  @IsInt({ message: '요일을 입력해주세요' })
  @ApiProperty({ type: Number, description: '요일번호', example: 3 })
  day: number;
}
