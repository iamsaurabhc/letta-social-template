import { IsString, IsDateString, IsUUID, IsEnum } from 'class-validator';

export class CreateScheduledPostDto {
  @IsString()
  content: string;

  @IsDateString()
  scheduledFor: Date;

  @IsUUID()
  agentId: string;

  @IsUUID()
  connectionId: string;

  @IsEnum(['normal', 'long_form'])
  format: 'normal' | 'long_form';
} 