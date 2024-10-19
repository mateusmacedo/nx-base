export interface IFindById<T, ID> {
  findById(id: ID): Promise<T | null>
}

export interface IFindAll<T> {
  findAll(): Promise<T[]>
}

export interface ISave<T> {
  save(entity: T): Promise<void>
}

export interface IDelete<ID> {
  delete(id: ID): Promise<void>
}

export interface IRepository<T, ID> extends IFindById<T, ID>, IFindAll<T>, ISave<T>, IDelete<ID> {}
