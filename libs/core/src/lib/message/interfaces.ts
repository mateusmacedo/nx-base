import { Result } from '../result/result';

export interface IMessage<T extends object | T[]> {
  readonly id: string
  readonly publisher: string
  readonly name: string
  readonly payload: T
  readonly timestamp: Date
  readonly correlation: string
}

export interface IHandler<T extends IMessage<any>, R, E extends Error> {
  canHandle(message: T): boolean
  handle(message: T): Result<R, E>
  asyncHandle(message: T): Promise<Result<R, E>>
}

export interface IPublisher<T extends IMessage<any>> {
  publish(message: T): Result<void, Error>
}

export interface ISubscriber<T extends IMessage<any>> {
  subscribe(handler: IHandler<T, any, any>): Result<void, Error>
}

export interface IChannel<T extends IMessage<any>> extends IPublisher<T>, ISubscriber<T> {}

export interface IBus<T extends IMessage<any>> extends IPublisher<T>, ISubscriber<T> {
  registerChannel(channel: IChannel<T>): Result<void, Error>
}
