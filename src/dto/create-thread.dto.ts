import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
export class CreateThreadDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly by: string;

  @IsNumber()
  @IsNotEmpty()
  readonly descendants: number;

  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsNumber()
  @IsNotEmpty()
  readonly score: number;

  @IsNumber()
  @IsNotEmpty()
  readonly commentsCount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly time: number;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly type: string;

  @IsString()
  @IsNotEmpty()
  readonly url: string;
}
