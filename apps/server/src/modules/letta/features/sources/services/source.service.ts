import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import { CreateSourceDto, UpdateSourceDto } from '../dto/source.dto';

@Injectable()
export class SourceService {
  private readonly logger = new Logger(SourceService.name);
  private readonly lettaClient: LettaClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LETTA_API_KEY');
    if (!apiKey) {
      throw new Error('LETTA_API_KEY is not configured');
    }
    
    this.lettaClient = new LettaClient({ token: apiKey });
  }

  async getSources() {
    try {
      this.logger.log('Fetching sources from Letta');
      return await this.lettaClient.sources.list();
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getSourceById(id: string) {
    try {
      this.logger.log(`Fetching source: ${id}`);
      return await this.lettaClient.sources.retrieve(id);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getSourceByName(name: string) {
    try {
      this.logger.log(`Fetching source by name: ${name}`);
      return await this.lettaClient.sources.getByName(name);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async createSource(sourceData: CreateSourceDto) {
    try {
      this.logger.log('Creating new source in Letta');
      return await this.lettaClient.sources.create(sourceData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async updateSource(id: string, sourceData: UpdateSourceDto) {
    try {
      this.logger.log(`Updating source: ${id}`);
      return await this.lettaClient.sources.modify(id, sourceData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async deleteSource(id: string) {
    try {
      this.logger.log(`Deleting source: ${id}`);
      await this.lettaClient.sources.delete(id);
      return { success: true };
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
      if (error.statusCode === 404) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
    throw error;
  }
} 