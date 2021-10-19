import { Injectable, Logger } from '@nestjs/common';
import { Consumer, KafkaClient, Message } from 'kafka-node';

@Injectable()
export class ActorService {
    private readonly logger = new Logger(ActorService.name);
    public client: KafkaClient = new KafkaClient({ kafkaHost: 'localhost:9092' })
    private actorConsumer;

    constructor() {
        this.actorConsumer = new Consumer(
            this.client,
            [
                { topic: 'alerts' },
            ], {});

        this.actorConsumer.on('message', (message) => {
            this.handleActorRead(message);
        });
    }

    handleActorRead(message: Message) {
        const data = JSON.parse(`${message.value}`);

        if (data.herzschlag >= 120 && data.sauerstoff <= 95 ) {
            this.logger.debug(`--- CRITICAL --- Kritischer Zustand: Puls ${data.herzschlag}, Sauerstoffsättigung ${data.sauerstoff}. Medikament wird ausgeschüttet!`)
        }
    }
}
