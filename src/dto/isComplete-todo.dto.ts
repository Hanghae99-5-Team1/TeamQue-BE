import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class isCompleteTodoDto {
  @IsInt({ message: '끝낸 할일을 선택해주세요' })
  @ApiProperty({ type: Number, description: '할일 메모 id', example: 1 })
  id: number;
}
