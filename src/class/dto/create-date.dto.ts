import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { DateDto } from './date.dto';

export class CreateDateDto {
  @IsString({ message: '시작일을 입력해주세요' })
  startDate: string;

  @IsString({ message: '종료일을 입력해주세요' })
  endDate: string;

  @IsArray({ message: '강의날짜를 배열로 입력해주세요' })
  @ValidateNested({ each: true })
  @Type(() => DateDto)
  times: DateDto[];
}
