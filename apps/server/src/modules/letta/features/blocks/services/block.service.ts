import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Letta, LettaClient, LettaError } from '@letta-ai/letta-client';
import { CreateBlockDto, UpdateBlockDto } from '../dto/block.dto';
import { BaseService } from '../../../services/base.service';

@Injectable()
export class BlockService extends BaseService {
  constructor(configService: ConfigService) {
    super(BlockService.name, configService);
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

  async createBlock(blockData: Letta.CreateBlock) {
    try {
      this.logger.log('Creating new block in Letta');
      this.logger.debug('Block data:', {
        label: blockData.label,
        valueLength: blockData.value.length,
        description: blockData.description
      });
      
      return await this.lettaClient.blocks.create(blockData);
    } catch (error) {
      this.logger.error('Failed to create block:', {
        error,
        blockData: {
          label: blockData.label,
          valueLength: blockData.value.length
        }
      });
      this.handleLettaError(error);
    }
  }

  async updateBlock(id: string, blockData: Letta.CreateBlock) {
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