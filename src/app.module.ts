import { Logger, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllerService } from './controller/controller.service';
import { ActorService } from './actor/actor.service';
import { SensorService } from './sensor/sensor.service';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    ControllerService,
    ActorService,
    SensorService
  ],
})
export class AppModule {}
