import { DatabaseError, NotFoundError, ValidationError } from '../error/error';
import { Result } from '../result/result';

export interface Entity<ID> {
  id: ID;
}

export interface IFindById<T extends Entity<ID>, ID> {
  findById(id: ID): Promise<Result<T|null, DatabaseError | NotFoundError>>
}

export interface IFindAll<T extends Entity<ID>, ID> {
  findAll(): Promise<Result<T[], DatabaseError>>
}

export interface ISave<T extends Entity<ID>, ID> {
  save(entity: T): Promise<Result<T, DatabaseError| ValidationError>>
}

export interface IDelete<ID> {
  delete(id: ID): Promise<Result<void, DatabaseError | NotFoundError>>
}

export interface IRepository<T extends Entity<ID>, ID, E = string> extends IFindById<T, ID>, IFindAll<T, ID>, ISave<T, ID>, IDelete<ID> {}
