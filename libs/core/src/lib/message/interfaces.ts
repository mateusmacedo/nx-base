import { Result } from '../result/result'

export interface IMessage<T extends object | T[]> {
  readonly id: string
  readonly publisher: string
  readonly name: string
  readonly payload: T
  readonly timestamp: Date
  readonly correlation: string
}

export interface IChannel <M extends IMessage<any>> {
  publish(message: M): Result<void, Error>
  subscribe(messageType: string, handler: (message: M) => void): Result<void, Error>
}

export interface IHandler<T extends IMessage<any>, R, E extends Error> {
  handle(message: T): Result<R, E>
}

export interface IBus<M extends IMessage<any>, H extends IHandler<any, any, any>> {
  publish(message: M): Result<void, Error>
  subscribe(messageType: string, handler: H): Result<void, Error>
}
