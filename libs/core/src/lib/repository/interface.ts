import { Result } from '../result/result'

export interface IFindById<T, ID> {
  findById(id: ID): Promise<Result<T, Error>>
}

export interface IFindAll<T> {
  findAll(): Promise<Result<T[], Error>>
}

export interface ISave<T> {
  save(entity: T): Promise<Result<T, Error>>
}

export interface IDelete<ID> {
  delete(id: ID): Promise<Result<void, Error>>
}

export interface IRepository<T, ID> extends IFindById<T, ID>, IFindAll<T>, ISave<T>, IDelete<ID> {}
