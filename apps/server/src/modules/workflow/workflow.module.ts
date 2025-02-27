import { Module } from "@nestjs/common";
import { WorkflowController } from "./workflow.controller";
import { WorkflowService } from "./workflow.service";
import { LettaModule } from "../letta/letta.module";
import { SocialModule } from "../social/social.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    LettaModule,
    SocialModule,
    ConfigModule,
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService]
})
export class WorkflowModule {} 