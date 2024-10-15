export interface IMediator<T, R> {
  mediate(msg: T): R
}
