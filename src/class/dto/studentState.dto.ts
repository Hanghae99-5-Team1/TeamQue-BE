import { IsBoolean, IsNotEmpty } from 'class-validator';

export class StudentStateDto {
  @IsNotEmpty()
  @IsBoolean()
  isOk: boolean;
}
