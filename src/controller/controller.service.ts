import { Injectable, Logger } from '@nestjs/common';
import { Consumer, KafkaClient, Message, Producer, ProduceRequest } from 'kafka-node';


@Injectable()
export class ControllerService {
    private readonly logger = new Logger(ControllerService.name);
    public client: KafkaClient = new KafkaClient({ kafkaHost: 'localhost:9092' })
    private sensorControllerConsumer;
    private sensorControllerProducer;
    private historicDataHeartbeat: Message[] = [];
    private historicDataOxygen: Message[] = [];
    private avgHeartbeat;
    private avgOxygen;

    constructor() {
        this.sensorControllerProducer = new Producer(this.client);
        this.sensorControllerConsumer = new Consumer(
            this.client,
            [
                { topic: 'herzschlag' },
                { topic: 'sauerstoff' },
            ], {});

        this.sensorControllerConsumer.on('message', (message) => {
            this.handleControllerRead(message);
        });
    }

    handleControllerRead(message: Message) {
        if (message.topic == 'herzschlag') {
            this.historicDataHeartbeat.push(message);
        } else {
            this.historicDataOxygen.push(message);
        }

        if (this.historicDataHeartbeat.length >= 3 || this.historicDataOxygen.length >= 3) {
            this.checkHeartbeat();
            this.checkOxygen();
        } else {
            this.logger.debug('Noch nicht genug historische Daten, Check übersprungen.')
        }

        this.checkVitals();   
    }

    checkHeartbeat() {
        const average = this.getAverage(this.historicDataHeartbeat);

        average < 120
            ? this.logger.log(`Herzschlag normal, Schnitt aus n - 3: ${average}`)
            : this.logger.warn(`Herzschlag ungewöhnlich hoch, Schnitt aus n - 3: ${average}`)     

        this.avgHeartbeat = average;
    }

    checkOxygen() {
        const average = this.getAverage(this.historicDataOxygen);

        average > 95
            ? this.logger.log(`Sauerstoffsättigung normal, Schnitt aus n - 3: ${average}`)
            : this.logger.warn(`Sauerstoffsättigung ungewöhnlich niedrig, Schnitt aus n - 3: ${average}`)

        this.avgOxygen = average;
    }

    checkVitals() {
        if (this.avgHeartbeat && this.avgOxygen) {
            const messages = `{ \"herzschlag\": \"${this.avgHeartbeat}\", \"sauerstoff\": \"${this.avgOxygen}\" }`
            const vitalsPayloads: ProduceRequest[] = [{ topic: 'alerts', messages }];

            this.sensorControllerProducer.send(vitalsPayloads, (result, error) => {
                this.logger.log(`gemeldete Durchschnitte: ${messages}, info: ${JSON.stringify(error)}`);
            });
        }   
    }

    getAverage(data: Message[]) {
        const previousBatch = data.slice(-3);
        const mappedBatch = previousBatch.map((m: Message) => Number(m.value))
    
        return mappedBatch.length
            ? (mappedBatch.reduce((acc, curr) => acc + curr) / 3).toFixed(2)
            : 0;
    }
}