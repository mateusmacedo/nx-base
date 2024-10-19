import { Result } from './result'

describe('Result', () => {
  describe('Result.ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok('success')
      expect(result.isSuccess).toBe(true)
      expect(result.isFailure).toBe(false)
      expect(result.value).toBe('success')
    })
  })

  describe('Result.fail', () => {
    it('should create a failed result', () => {
      const result = Result.fail('error')
      expect(result.isSuccess).toBe(false)
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('error')
    })
  })

  describe('value getter', () => {
    it('should return the value for a successful result', () => {
      const result = Result.ok('success')
      expect(result.value).toBe('success')
    })

    it('should throw an error for a failed result', () => {
      const result = Result.fail('error')
      expect(() => result.value).toThrow('Cannot get the value of a failed result.')
    })
  })

  describe('error getter', () => {
    it('should return the error for a failed result', () => {
      const result = Result.fail('error')
      expect(result.error).toBe('error')
    })

    it('should throw an error for a successful result', () => {
      const result = Result.ok('success')
      expect(() => result.error).toThrow('Cannot get the error of a successful result.')
    })
  })

  describe('asyncAndThen', () => {
    it('should chain successful results', async () => {
      const result = Result.ok('success')
      const chainedResult = await result.asyncAndThen(async (value) => Result.ok(value + ' chained'))
      expect(chainedResult.isSuccess).toBe(true)
      expect(chainedResult.value).toBe('success chained')
    })

    it('should handle failed results', async () => {
      const result = Result.fail('error')
      const chainedResult = await result.asyncAndThen(async (value) => Result.ok(value + ' chained'))
      expect(chainedResult.isFailure).toBe(true)
      expect(chainedResult.error).toBe('error')
    })
  })

  describe('onFailure', () => {
    it('should execute the provided function on failure', () => {
      const result = Result.fail('error')
      const mockFn = jest.fn()
      result.onFailure(mockFn)
      expect(mockFn).toHaveBeenCalledWith('error')
    })

    it('should not execute the provided function on success', () => {
      const result = Result.ok('success')
      const mockFn = jest.fn()
      result.onFailure(mockFn)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })
})
