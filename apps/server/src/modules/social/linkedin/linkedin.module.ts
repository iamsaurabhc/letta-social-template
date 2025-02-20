import { Module } from '@nestjs/common';
import { LinkedInController } from './controllers/linkedin.controller';
import { LinkedInService } from './services/linkedin.service';

@Module({
  controllers: [LinkedInController],
  providers: [LinkedInService],
  exports: [LinkedInService]
})
export class LinkedInModule {} 