import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  MaxLength,
} from 'class-validator';
export class CreateCommentDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly by: string;

  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsArray()
  readonly kids: Array<number>;

  @IsNumber()
  @IsNotEmpty()
  readonly parent: number;

  @IsString()
  // @IsNotEmpty()
  readonly text: string;

  @IsNumber()
  @IsNotEmpty()
  readonly time: number;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly type: string;
}
