import { Result } from '../../result/result'
import { IChannel, IHandler, IMessage } from '../interfaces'

export type ICommand<T extends object> = IMessage<T>
export type ICommandChannel<T extends ICommand<any>> = IChannel<T>
export type ICommandHandler<T extends ICommand<any>, R, E extends Error> = IHandler<T, R, E>
export interface ICommandSubscriber<T extends ICommand<any>> {
  subscribe(handler: ICommandHandler<T, any, any>): Result<void, Error>
}
export interface ICommandPublisher<T extends ICommand<any>> {
  publish(command: T): Result<void, Error>
}
export interface ICommandBus<T extends ICommand<any>> extends ICommandPublisher<T>, ICommandSubscriber<T> {
  registerChannel(channel: ICommandChannel<T>): Result<void, Error>
}


export type IQuery<T extends object> = IMessage<T>
export type IQueryChannel<T extends IQuery<any>> = IChannel<T>
export type IQueryHandler<T extends IQuery<any>, R, E extends Error> = IHandler<T, R, E>
export interface IQuerySubscriber<T extends IQuery<any>> {
  subscribe(handler: IQueryHandler<T, any, any>): Result<void, Error>
}
export interface IQueryPublisher<T extends IQuery<any>> {
  publish(query: T): Result<void, Error>
}
export interface IQueryBus<T extends IQuery<any>> extends IQueryPublisher<T>, IQuerySubscriber<T> {
  registerChannel(channel: IQueryChannel<T>): Result<void, Error>
}
