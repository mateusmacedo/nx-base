export class Result<T, E> {
  private constructor(private readonly _value?: T, private readonly _error?: E) { }

  get isSuccess(): boolean {
    return this._error === undefined
  }

  get isFailure(): boolean {
    return !this.isSuccess
  }

  get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of a failed result.')
    }
    return this._value as T
  }

  get error(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get the error of a successful result.')
    }
    return this._error as E
  }

  public static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(value)
  }

  public static fail<T = never, E = any>(error: E): Result<T, E> {
    if (error === undefined) {
      throw new Error('Error cannot be undefined')
    }
    return new Result<T, E>(undefined, error)
  }

  public async andThenAsync<U>(func: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    if (this.isFailure) {
      return Result.fail<U, E>(this.error)
    }
    return await func(this.value as T)
  }

  public andThen<U>(func: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this.error)
    }
    return func(this.value as T)
  }

  public onFailure(func: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      func(this.error as E)
    }
    return this
  }

  public onSuccess(func: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      func(this.value as T)
    }
    return this
  }
}

export type ResultOk<T> = Result<T, never>
export type ResultFail<E> = Result<never, E>
export type ResultOr<T, E> = Result<T, E>

