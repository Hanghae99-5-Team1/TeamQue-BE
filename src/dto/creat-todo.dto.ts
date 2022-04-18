import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString({ message: '할일을 입력해주세요' })
  @ApiProperty({ type: String, description: '할일 메모', example: '메모요~!' })
  content: string;
}
