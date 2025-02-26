import { IsEnum, IsObject, IsBoolean, IsOptional, IsArray, IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type as TransformType } from 'class-transformer';

export enum PostingMode {
  AUTOMATIC = 'automatic',
  MANUAL_APPROVAL = 'manual_approval'
}

export class CustomScheduleDto {
  @IsArray()
  @IsString({ each: true })
  days: string[];

  @IsString()
  time: string;
}

export class NewPostsSettingsDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  format?: 'normal' | 'long_form' | 'both';

  @IsOptional()
  @IsString()
  frequency?: 'daily' | 'weekly' | 'custom';

  @IsOptional()
  @ValidateNested()
  @TransformType(() => CustomScheduleDto)
  customSchedule?: CustomScheduleDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicsOfInterest?: string[];
  
  @IsOptional()
  @IsNumber()
  postsPerPeriod?: number;
}

export class EngagementSettingsDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsBoolean()
  replyToComments?: boolean;

  @IsOptional()
  @IsBoolean()
  replyToMentions?: boolean;

  @IsOptional()
  @IsBoolean()
  replyToDMs?: boolean;
}

export class LeadsGenerationSettingsDto {
  @IsBoolean()
  enabled: boolean;
}

export class LeadsNurturingSettingsDto {
  @IsBoolean()
  enabled: boolean;
}

export class TriggersDto {
  @ValidateNested()
  @TransformType(() => NewPostsSettingsDto)
  newPosts: NewPostsSettingsDto;

  @ValidateNested()
  @TransformType(() => EngagementSettingsDto)
  engagement: EngagementSettingsDto;

  @ValidateNested()
  @TransformType(() => LeadsGenerationSettingsDto)
  leadsGeneration: LeadsGenerationSettingsDto;

  @ValidateNested()
  @TransformType(() => LeadsNurturingSettingsDto)
  leadsNurturing: LeadsNurturingSettingsDto;
}

export class TriggerSettingsDto {
  @IsEnum(PostingMode)
  postingMode: PostingMode;

  @IsObject()
  @ValidateNested()
  @TransformType(() => TriggersDto)
  triggers: TriggersDto;
} 