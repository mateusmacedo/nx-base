import { LogLevel } from '../interface'
import { JsonFormatter } from './json'

describe('JsonFormatter', () => {
  let formatter: JsonFormatter

  beforeEach(() => {
    formatter = new JsonFormatter()
  })

  // Happy Path
  it("Format a log entry with level 'info', message 'Application started', and no meta data.", () => {
    const result = formatter.format(LogLevel.INFO, 'Application started')
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe('Application started')
    expect(parsedResult.meta).toEqual({})
    expect(parsedResult).toHaveProperty('timestamp')
    expect(parsedResult).toHaveProperty('pid')
  })

  it("Format a log entry with level 'error', message 'An error occurred', and meta data containing error details.", () => {
    const meta = { error: 'SomeError', stack: 'stacktrace' }
    const result = formatter.format(LogLevel.ERROR, 'An error occurred', meta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.ERROR)
    expect(parsedResult.message).toBe('An error occurred')
    expect(parsedResult.meta).toEqual(meta)
  })

  it("Format a log entry with level 'warn', message 'This is a warning', and meta data as an empty object.", () => {
    const result = formatter.format(LogLevel.WARN, 'This is a warning', {})
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.WARN)
    expect(parsedResult.message).toBe('This is a warning')
    expect(parsedResult.meta).toEqual({})
  })

  it("Format a log entry with level 'debug', message 'Debugging information', and meta data containing user ID.", () => {
    const meta = { userId: '12345' }
    const result = formatter.format(LogLevel.DEBUG, 'Debugging information', meta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.DEBUG)
    expect(parsedResult.message).toBe('Debugging information')
    expect(parsedResult.meta).toEqual(meta)
  })

  it("Format a log entry with level 'info', message 'User logged in', and meta data containing user details.", () => {
    const meta = { userId: '123', name: 'John Doe' }
    const result = formatter.format(LogLevel.INFO, 'User logged in', meta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe('User logged in')
    expect(parsedResult.meta).toEqual(meta)
  })

  it("Format a log entry with level 'fatal', message 'Critical failure', and meta data containing stack trace.", () => {
    const meta = { stack: 'stacktrace details' }
    const result = formatter.format(LogLevel.FATAL, 'Critical failure', meta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.FATAL)
    expect(parsedResult.message).toBe('Critical failure')
    expect(parsedResult.meta).toEqual(meta)
  })

  // Edge Cases
  it('Format a log entry with a valid LogLevel and a message containing special characters (e.g., emojis).', () => {
    const result = formatter.format(LogLevel.INFO, 'Special chars 💡🚀')
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe('Special chars 💡🚀')
  })

  it('Format a log entry with a valid LogLevel and an empty message string.', () => {
    const result = formatter.format(LogLevel.INFO, '')
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe('')
  })

  it('Format a log entry with a valid LogLevel and a meta object containing nested properties.', () => {
    const meta = { user: { id: '123', details: { location: 'USA' } } }
    const result = formatter.format(LogLevel.INFO, 'Nested properties', meta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta).toEqual(meta)
  })

  it('Format a log entry with a valid LogLevel and a meta object that is an empty array.', () => {
    const result = formatter.format(LogLevel.INFO, 'Empty array meta', [])
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta).toEqual([])
  })

  it('Format a log entry with a valid LogLevel and a meta object that is a large object with many properties.', () => {
    const largeMeta = Array.from({ length: 1000 }, (_, i) => ({ [`key${i}`]: `value${i}` })).reduce(
      (acc, cur) => Object.assign(acc, cur),
      {}
    )
    const result = formatter.format(LogLevel.INFO, 'Large meta', largeMeta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta).toEqual(largeMeta)
  })

  it('Format a log entry with a valid LogLevel and a message that is a very long string.', () => {
    const longMessage = 'A'.repeat(10000)
    const result = formatter.format(LogLevel.INFO, longMessage)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe(longMessage)
  })

  it('Format a log entry with a valid LogLevel and a meta object that contains a circular reference.', () => {
    const circularMeta: Record<string, unknown> = { key: 'value' }
    circularMeta.self = circularMeta // Circular reference

    const result = formatter.format(LogLevel.INFO, 'Circular meta', circularMeta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta.key).toBe('value')
    expect(parsedResult.meta.self).toBe('[Circular]')
  })

  it('Format a log entry with a valid LogLevel and a null meta parameter.', () => {
    const result = formatter.format(LogLevel.INFO, 'Null meta', null)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta).toEqual({})
  })

  it('Format a log entry with a valid LogLevel and a meta parameter that is a number.', () => {
    const result = formatter.format(LogLevel.INFO, 'Number meta', 1234)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta).toEqual({})
  })

  it('Format a log entry with a valid LogLevel and a message that is a string representation of a JSON object.', () => {
    const result = formatter.format(LogLevel.INFO, '{"key":"value"}')
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe('{"key":"value"}')
  })

  it('Format a log entry with a valid LogLevel and a meta object that includes a function.', () => {
    const meta = { fn: () => 'hello' }
    const result = formatter.format(LogLevel.INFO, 'Function in meta', meta)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.meta).toEqual({})
  })

  it('Format a log entry with a valid LogLevel and a message that is undefined.', () => {
    const result = formatter.format(LogLevel.INFO, undefined as unknown as string)
    const parsedResult = JSON.parse(result)

    expect(parsedResult.level).toBe(LogLevel.INFO)
    expect(parsedResult.message).toBe('undefined')
  })
})
