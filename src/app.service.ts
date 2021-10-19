import { Injectable, Logger } from '@nestjs/common';
import { CreateTopicResponse, KafkaClient, KafkaClientOptions, Producer, ProduceRequest } from 'kafka-node';

@Injectable()
export class AppService {
  constructor(private readonly logger: Logger) {}
  client: KafkaClient;

  getHello(): string {
    return 'Hello World!';
  }

  setup() {
    // Set up client which connects to Kafka
    this.client = this.createClient();
    this.logger.debug("Client created, connection to Kafka Server established.")

    // Set up topics if they don't already exist
    this.createTopics(this.client);
    this.logger.debug("Topics created.")
  }

  createClient(): KafkaClient {
    return new KafkaClient({ kafkaHost: 'localhost:9092' });
  }

  createTopics(client: KafkaClient) {
    const topicsToCreate = [
      { 
        topic: 'herzschlag',
        partitions: 1,
        replicationFactor: 1,
      },
      {
        topic: 'sauerstoff',
        partitions: 1,
        replicationFactor: 1,
      },
      {
        topic: 'alerts',
        partitions: 1,
        replicationFactor: 1,
      },
    ];

    client.createTopics(topicsToCreate, (error, result) => {
      this.logger.debug(result);
    });

  }
}
