import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Result } from '../result/result';

export interface IEvent<T extends object, ID> {
  id: ID
  publisher: string
  name: string
  payload: T
  occurredAt: Date
}

export interface IEventBus {
  publish<T extends object, ID>(event: IEvent<T, ID>): Result<void, Error>
  subscribe<T extends object, ID>(eventType: string): Observable<Result<IEvent<T, ID>, Error>>
}

export class EventBus implements IEventBus {
  private eventSubject = new Subject<IEvent<any, any>>();
  publish<T extends object, ID>(event: IEvent<T, ID>): Result<void, Error> {
    this.eventSubject.next(event)
    return Result.ok(undefined)
  }

  subscribe<T extends object, ID>(eventType: string): Observable<Result<IEvent<T, ID>, Error>> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.name === eventType),
      map(event => Result.ok<IEvent<T, ID>, Error>(event))
    )
  }
}
