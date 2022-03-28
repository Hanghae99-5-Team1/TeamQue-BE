import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditInfoDto {
  @IsOptional()
  @IsString({ message: '문자열을 입력해주세요' })
  @MinLength(2, { message: '2자이상을 입력해주세요' })
  @MaxLength(20, { message: '20자 이하를 입력해주세요' })
  name?: string;

  @IsOptional()
  @IsString({ message: '문자열을 입력해주세요' })
  @MinLength(4, { message: '4자이상을 입력해주세요' })
  @MaxLength(20, { message: '20자 이하를 입력해주세요' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호를 영어와 숫자로만 만들어주세요 ',
  })
  password?: string;

  @IsOptional()
  @IsString({ message: '문자열을 입력해주세요' })
  @MinLength(4, { message: '4자이상을 입력해주세요' })
  @MaxLength(20, { message: '20자 이하를 입력해주세요' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호를 영어와 숫자로만 만들어주세요 ',
  })
  confirmPassword?: string;
}
