import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommnetDto {
  @IsNotEmpty({ message: '댓글을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  content: string;
}
