import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateUserDto {
  @IsMongoId({ message: '_id is not valid' })
  @IsNotEmpty({ message: '_id is required.' })
  _id: string;

  @IsOptional()
  name: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;

  @IsOptional()
  image: string;
}
