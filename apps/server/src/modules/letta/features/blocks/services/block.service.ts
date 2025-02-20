import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import { CreateBlockDto, UpdateBlockDto } from '../dto/block.dto';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);
  private readonly lettaClient: LettaClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LETTA_API_KEY');
    if (!apiKey) {
      throw new Error('LETTA_API_KEY is not configured');
    }
    
    this.lettaClient = new LettaClient({ token: apiKey });
  }

  async getBlocks() {
    try {
      this.logger.log('Fetching blocks from Letta');
      return await this.lettaClient.blocks.list();
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getBlockById(id: string) {
    try {
      this.logger.log(`Fetching block: ${id}`);
      return await this.lettaClient.blocks.retrieve(id);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async createBlock(blockData: CreateBlockDto) {
    try {
      this.logger.log('Creating new block in Letta');
      return await this.lettaClient.blocks.create(blockData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async updateBlock(id: string, blockData: UpdateBlockDto) {
    try {
      this.logger.log(`Updating block: ${id}`);
      return await this.lettaClient.blocks.modify(id, blockData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async deleteBlock(id: string) {
    try {
      this.logger.log(`Deleting block: ${id}`);
      return await this.lettaClient.blocks.delete(id);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getBlockAgents(blockId: string) {
    try {
      this.logger.log(`Fetching agents for block: ${blockId}`);
      return await this.lettaClient.blocks.listAgentsForBlock(blockId);
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