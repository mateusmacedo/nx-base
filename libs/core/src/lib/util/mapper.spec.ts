import { plainToClass, Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import 'reflect-metadata'
import { transformAndValidate, transformToClass, validateInstance } from './mapper'

class NestedDTO {
  @IsString()
  nestedProp!: string
}

class SampleDTO {
  @IsOptional()
  @IsString()
  prop1?: string

  @IsOptional()
  @IsInt()
  prop2?: number

  @ValidateNested()
  @Type(() => NestedDTO)
  nested?: NestedDTO

  @ValidateNested({ each: true })
  @Type(() => NestedDTO)
  nestedArray?: NestedDTO[]
}

describe('Mapper Utility Functions', () => {
  describe('transformToClass', () => {
    it('should transform a plain object to a class instance', () => {
      const plain = { prop1: 'test', prop2: 123 }
      const instance = transformToClass(SampleDTO, plain)
      expect(instance).toBeInstanceOf(SampleDTO)
      expect(instance.prop1).toBe('test')
      expect(instance.prop2).toBe(123)
    })
  })

  describe('validateInstance', () => {
    it('should validate a valid instance without errors', async () => {
      const instance = plainToClass(SampleDTO, { prop1: 'test', prop2: 123 })
      await expect(validateInstance(instance)).resolves.not.toThrow()
    })

    it('should throw validation errors for an invalid instance', async () => {
      const instance = plainToClass(SampleDTO, { prop1: 123 })
      await expect(validateInstance(instance)).rejects.toThrow('Validation failed: prop1 must be a string')
    })
  })

  describe('transformAndValidate', () => {
    it('should transform and validate a plain object successfully', async () => {
      const plain = { prop1: 'test', prop2: 123 }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance).toBeInstanceOf(SampleDTO)
      expect(instance.prop1).toBe('test')
      expect(instance.prop2).toBe(123)
    })

    it('should handle nested objects correctly', async () => {
      const plain = { prop1: 'test', nested: { nestedProp: 'nested' } }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance.nested).toBeInstanceOf(NestedDTO)
      expect(instance.nested?.nestedProp).toBe('nested')
    })

    it('should handle arrays of objects correctly', async () => {
      const plain = { prop1: 'test', nestedArray: [{ nestedProp: 'nested1' }, { nestedProp: 'nested2' }] }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance.nestedArray?.length).toBe(2)
      expect(instance.nestedArray?.[0]).toBeInstanceOf(NestedDTO)
      expect(instance.nestedArray?.[0].nestedProp).toBe('nested1')
    })

    it('should throw validation errors for incorrect types', async () => {
      const plain = { prop1: 123 }
      await expect(transformAndValidate(SampleDTO, plain)).rejects.toThrow('Validation failed: prop1 must be a string')
    })

    it('should handle an empty object', async () => {
      const plain = {}
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance).toBeInstanceOf(SampleDTO)
      expect(instance.prop1).toBeUndefined()
      expect(instance.prop2).toBeUndefined()
    })

    it('should handle null values for optional properties', async () => {
      const plain = { prop1: 'test', prop2: null }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance.prop2).toBeNull()
    })

    it('should handle undefined properties', async () => {
      const plain = { prop1: 'test', prop2: undefined }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance.prop2).toBeUndefined()
    })

    it('should handle circular references', async () => {
      const plain: any = { prop1: 'test' }
      plain.self = plain
      await expect(transformAndValidate(SampleDTO, plain)).rejects.toThrow()
    })

    it('should handle a large number of properties', async () => {
      const plain = { prop1: 'test', prop2: 123, ...Array.from({ length: 1000 }, (_, i) => ({ [`prop${i + 3}`]: i })) }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect(instance).toBeInstanceOf(SampleDTO)
    })

    it('should ignore properties that are functions', async () => {
      const plain = {
        prop1: 'test',
        func: () => {
          return null
        }
      }
      const instance = await transformAndValidate(SampleDTO, plain)
      expect((instance as any).func).toBeUndefined()
    })

    it('should throw validation errors for a mix of valid and invalid properties', async () => {
      const plain = { prop1: 'test', prop2: 'invalid' }
      await expect(transformAndValidate(SampleDTO, plain)).rejects.toThrow(
        'Validation failed: prop2 must be an integer number'
      )
    })
  })
})
