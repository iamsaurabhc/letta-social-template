import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import { createReadStream } from 'fs';
import { ReadStream } from 'fs';

@Injectable()
export class SourceFileService {
  private readonly logger = new Logger(SourceFileService.name);
  private readonly lettaClient: LettaClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LETTA_API_KEY');
    if (!apiKey) {
      throw new Error('LETTA_API_KEY is not configured');
    }
    
    this.lettaClient = new LettaClient({ token: apiKey });
  }

  async uploadFile(file: Express.Multer.File, sourceId: string) {
    try {
      this.logger.log(`Uploading file to source: ${sourceId}`);
      const fileStream: ReadStream = createReadStream(file.path);
      return await this.lettaClient.sources.files.upload(fileStream, sourceId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async listFiles(sourceId: string) {
    try {
      this.logger.log(`Listing files for source: ${sourceId}`);
      return await this.lettaClient.sources.files.list(sourceId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async deleteFile(sourceId: string, fileId: string) {
    try {
      this.logger.log(`Deleting file ${fileId} from source ${sourceId}`);
      return await this.lettaClient.sources.files.delete(sourceId, fileId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  private handleLettaError(error: unknown) {
    if (error instanceof LettaError) {
      this.logger.error(`Letta API error: ${error.message}`, {
        statusCode: error.statusCode,
        body: error.body
      });
      throw new InternalServerErrorException(error.message);
    }
    throw error;
  }
} 