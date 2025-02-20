import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsNumber()
  limit: number;
}

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;
} 