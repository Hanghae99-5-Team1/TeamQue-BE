import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { DateDto } from './date.dto';

export class CreateClassDto {
  @IsString({ message: '제목을 입력해주세요' })
  title: string;

  @IsOptional()
  @IsUrl({ message: 'url을 입력해주세요' })
  imageUrl?: string;

  @IsString({ message: '시작일을 입력해주세요' })
  startDate: string;

  @IsString({ message: '종료일을 입력해주세요' })
  endDate: string;

  @IsArray({ message: '강의날짜를 배열로 입력해주세요' })
  @ValidateNested({ each: true })
  @Type(() => DateDto)
  times: DateDto[];
}
