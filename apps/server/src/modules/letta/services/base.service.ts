import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LettaClient } from '@letta-ai/letta-client';

@Injectable()
export class BaseService {
  protected readonly logger: Logger;
  protected readonly lettaClient: LettaClient;

  constructor(
    serviceName: string,
    protected readonly configService: ConfigService,
  ) {
    this.logger = new Logger(serviceName);
    const lettaUrl = this.configService.get<string>('LETTA_API_URL');
    const lettaPassword = this.configService.get<string>('LETTA_PASSWORD');

    if (!lettaUrl) {
      throw new Error('LETTA_API_URL is not configured');
    }

    this.lettaClient = new LettaClient({
      baseUrl: lettaUrl.startsWith('http') ? lettaUrl : `https://${lettaUrl}`,
      ...(lettaPassword && { token: lettaPassword }),
    });
  }
} 