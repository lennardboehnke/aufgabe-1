import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KafkaClient, Producer, ProduceRequest } from 'kafka-node';

@Injectable()
export class SensorService {
    private readonly logger = new Logger(SensorService.name);
    public client: KafkaClient = new KafkaClient({ kafkaHost: 'localhost:9092' })
    private heartbeatSensor;
    private oxygenSensor;

    constructor() {
        this.heartbeatSensor = new Producer(this.client);
        this.oxygenSensor = new Producer(this.client);
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    handleHeartbeatCron() {
        const messages = `${this.randomIntFromInterval(60, 180)}`
        const hearbeatPayloads: ProduceRequest[] = [{ topic: 'herzschlag', messages }];

        this.heartbeatSensor.send(hearbeatPayloads, (result, error) => {
            this.logger.log(`Puls: ${messages}, info: ${JSON.stringify(error)}`);
        });
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    handleOxygenCron() {
        const messages = `${this.randomIntFromInterval(90, 100)}`
        const oxygenPayloads: ProduceRequest[] = [{ topic: 'sauerstoff', messages }];

        this.oxygenSensor.send(oxygenPayloads, (result, error) => {
            this.logger.log(`Sauerstoffsättigung: ${messages}, info: ${JSON.stringify(error)}`);
        });
    }

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
      }
}