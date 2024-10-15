export interface IHandler<T, R> {
  handle(target: T): R
}
