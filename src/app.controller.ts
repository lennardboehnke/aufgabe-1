import { Controller, Get } from '@nestjs/common';
import { KafkaClient } from 'kafka-node';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/createClient')
  createClient(): KafkaClient {
    return this.appService.createClient();
  }

  @Get('/setup')
  setup() {
    return this.appService.setup();
  }

}
