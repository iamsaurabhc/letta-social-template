import { Controller, Get, Post, Delete, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SourceFileService } from '../services/source-file.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';
import { Express } from 'express';

@Controller('letta/sources')
@UseGuards(JwtAuthGuard)
export class SourceFileController {
  constructor(private readonly sourceFileService: SourceFileService) {}

  @Post(':sourceId/files')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('sourceId') sourceId: string,
  ) {
    return this.sourceFileService.uploadFile(file, sourceId);
  }

  @Get(':sourceId/files')
  async listFiles(@Param('sourceId') sourceId: string) {
    return this.sourceFileService.listFiles(sourceId);
  }

  @Delete(':sourceId/files/:fileId')
  async deleteFile(
    @Param('sourceId') sourceId: string,
    @Param('fileId') fileId: string,
  ) {
    return this.sourceFileService.deleteFile(sourceId, fileId);
  }
} 