import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class changeOrderTodoDto {
  @IsInt({ message: '순서를 바꾸고 싶은 할일을 선택해주세요' })
  @ApiProperty({ type: Number, description: '바꿀 메모', example: 1 })
  from: number;

  @IsInt({ message: '순서를 바꾸고 싶은 할일을 선택해주세요' })
  @ApiProperty({ type: Number, description: '바꿀 메모', example: 2 })
  to: number;
}
