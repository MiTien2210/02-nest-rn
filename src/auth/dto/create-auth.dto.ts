import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Username is required.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @IsOptional()
  name: string;
}
