import { Observer } from '../observer/observer';
import { BasicObserver } from './basicObserver';

export class PublisherSubscriber<Result>
  extends BasicObserver<Result>
  implements Observer {
  protected subscribers: {
    [subject: string]: ((...params) => Promise<Result>)[];
  };
  constructor() {
    super();
    this.subscribers = {};
  }

  public getTopics(): string[] {
    const topics = new Array<string>();
    const newProps = Object.getOwnPropertyNames(this.subscribers);
    for (const prop of newProps) {
      if (!topics.includes(prop)) topics.push(prop);
    }

    return topics;
  }

  public subscribe(
    topic: string,
    subscriber: (...params) => Promise<Result>
  ): Promise<Result[]> {
    this.checkSubscribers(topic);
    this.subscribers[topic].push(subscriber);
    return Promise.all([]);
  }

  public unsubscribe(
    topic: string,
    subscriber?: (...params) => Promise<Result>
  ): ((...params) => Promise<Result>)[] {
    this.checkSubscribers(topic);
    this.subscribers[topic] = this.subscribers[topic].filter(
      (element) => element !== subscriber
    );
    return this.subscribers[topic];
  }

  public async publish(topic: string, ...params): Promise<Result[]> {
    this.checkSubscribers(topic);
    const subscribers = this.subscribers[topic];
    return Promise.all(subscribers.map((subscriber) => subscriber(...params)));
  }

  protected checkSubscribers(topic: string): void {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = new Array<(...params) => Promise<Result>>();
    }
  }
}
