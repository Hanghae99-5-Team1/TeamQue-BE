import { IsString } from 'class-validator';

export class CreateCommnetDto {
  @IsString({ message: '댓글을 입력해주세요' })
  content: string;
}
