import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { DateDto } from './date.dto';

export class UpdateClassDto {
  @IsNotEmpty({ message: '강의명을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  title: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
