import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PROGRESS', 'FINISHED'])
  status: string;
}
