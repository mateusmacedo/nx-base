import { Result } from '../../result/result'
import { IChannel, IHandler, IMessage } from '../interfaces'

export type IEvent<T extends object> = IMessage<T>
export type IEventChannel<T extends IEvent<any>> = IChannel<T>
export type IEventHandler<T extends IEvent<any>, R, E extends Error> = IHandler<T, R, E>
export interface IEventSubscriber<T extends IEvent<any>> {
  subscribe(handler: IEventHandler<T, any, any>): Result<void, Error>
}
export interface IEventPublisher<T extends IEvent<any>> {
  publish(event: T): Result<void, Error>
}
export interface IEventBus<T extends IEvent<any>> extends IEventPublisher<T>, IEventSubscriber<T> {
  registerChannel(channel: IEventChannel<T>): Result<void, Error>
}

export interface IAggregateRoot {
  apply(event: IEvent<any>): Result<void, Error>
  getUncommittedEvents(): Result<IEvent<any>[], Error>
  clearUncommittedEvents(): Result<void, Error>
}

export interface IEventStore<T extends IEvent<any>> {
  saveEvents(events: T[]): Result<void, Error>
  getEventsForAggregate(aggregate: IAggregateRoot): Result<T[], Error>
}

export interface IProjection<T extends IEvent<any>> {
  project(event: T): Result<void, Error>
}
