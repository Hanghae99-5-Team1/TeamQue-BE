import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class OnewordDto {
  @IsNotEmpty()
  @IsString({ message: '문자열을 입력해주세요' })
  @MinLength(2, { message: '2자이상을 입력해주세요' })
  @MaxLength(20, { message: '20자 이하를 입력해주세요' })
  oneword: string;
}
