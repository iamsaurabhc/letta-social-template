import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { message: 'SocialSpi Server is running!' };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'socialspi-server'
    };
  }

  @Get('ping')
  getPing() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'socialspi-server'
    };
  }
} 