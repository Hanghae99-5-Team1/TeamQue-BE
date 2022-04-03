import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommnetDto {
  @IsString({ message: '댓글을 입력해주세요' })
  @ApiProperty({ type: String, description: '댓글', example: '댓글이오~!' })
  content: string;
}
