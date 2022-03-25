import { IsNotEmpty, IsString } from 'class-validator';
import { BoardTypes } from '../model/boardType.model';

export class CreateBoardDto {
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  title: string;

  @IsNotEmpty({ message: '내용을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  description: string;

  @IsNotEmpty()
  boardType: BoardTypes;
}
