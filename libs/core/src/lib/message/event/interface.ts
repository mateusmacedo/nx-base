import { IBus, IHandler, IMessage } from '../interfaces'

export type IEvent<T extends object> = IMessage<T>
export type IEventHandler<T extends IEvent<any>, R, E extends Error> = IHandler<T, R, E>
export type IEventBus = IBus<IEvent<any>, IEventHandler<any, any, any>>
