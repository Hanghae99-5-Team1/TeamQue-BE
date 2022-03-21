import { IsNotEmpty } from 'class-validator';

export class CreateCommnetDto {
  @IsNotEmpty({ message: '댓글을 입력해주세요' })
  description: string;
}
