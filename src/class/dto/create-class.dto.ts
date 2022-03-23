import { IsNotEmpty } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty({ message: '강의명을 입력해주세요' })
  title: string;
}
