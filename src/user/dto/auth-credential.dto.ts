import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthCredentialsDto {
  @MinLength(2, { message: '이름을 2자 이상 입력해주세요' })
  @MaxLength(20, { message: '이름을 20자 이하 입력해주세요' })
  @IsString({ message: '이름을 입력해주세요' })
  name: string;

  @IsEmail({ message: '이메일형식을 지켜주세요' })
  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  email: string;

  @MinLength(4, { message: '비밀번호를 4자이상을 입력해주세요' })
  @MaxLength(20, { message: '비밀번호를 20자 이하를 입력해주세요' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호를 영어와 숫자로만 만들어주세요 ',
  })
  @IsString({ message: '비밀번호를 입력해주세요' })
  password;

  @MinLength(4, { message: '비밀번호를 4자이상을 입력해주세요' })
  @MaxLength(20, { message: '비밀번호를 20자 이하를 입력해주세요' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호를 영어와 숫자로만 만들어주세요 ',
  })
  @IsString({ message: '비밀번호 확인을 입력해주세요' })
  confirmPassword;
}
