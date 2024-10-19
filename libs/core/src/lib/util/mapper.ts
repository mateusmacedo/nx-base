import { plainToClass } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'

export function transformToClass<T extends object>(dtoClass: new () => T, plain: object): T {
  return plainToClass(dtoClass, plain)
}

export async function validateInstance<T extends object>(instance: T): Promise<void> {
  const errors: ValidationError[] = await validate(instance)
  if (errors.length > 0) {
    const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ')
    throw new Error(`Validation failed: ${errorMessages}`)
  }
}

export async function transformAndValidate<T extends object>(cls: new () => T, plain: object): Promise<T> {
  // Remove propriedades que são funções
  const sanitizedPlain = Object.fromEntries(Object.entries(plain).filter(([, value]) => typeof value !== 'function'))

  const instance = plainToClass(cls, sanitizedPlain)
  const errors = await validate(instance)

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ')

    throw new Error(`Validation failed: ${errorMessages}`)
  }

  return instance
}
