import { ILogFormatter, LogLevel } from '../interface'
import { JsonTransport } from './json'

describe('JsonTransport', () => {
  let mockFormatter: jest.Mocked<ILogFormatter>
  let transport: JsonTransport

  beforeEach(() => {
    mockFormatter = {
      format: jest.fn((level, message, meta) => JSON.stringify({ level, message, meta }))
    }
    transport = new JsonTransport(mockFormatter)
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("JsonTransport logs a message with LogLevel 'info' and a simple string message.", () => {
    transport.log(LogLevel.INFO, 'Test message')
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, 'Test message', undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: 'Test message', meta: undefined })
    )
  })

  it("JsonTransport logs a message with LogLevel 'error' and a string message along with metadata.", () => {
    const meta = { userId: '123' }
    transport.log(LogLevel.ERROR, 'Error occurred', meta)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.ERROR, 'Error occurred', meta)
    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ level: LogLevel.ERROR, message: 'Error occurred', meta }))
  })

  it("JsonTransport logs a message with LogLevel 'warn' and a string message without metadata.", () => {
    transport.log(LogLevel.WARN, 'Warning message')
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.WARN, 'Warning message', undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.WARN, message: 'Warning message', meta: undefined })
    )
  })

  it("JsonTransport logs a message with LogLevel 'debug' and a string message with complex metadata object.", () => {
    const meta = { userId: '123', action: 'login' }
    transport.log(LogLevel.DEBUG, 'Debugging session', meta)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.DEBUG, 'Debugging session', meta)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.DEBUG, message: 'Debugging session', meta })
    )
  })

  it("JsonTransport logs a message with LogLevel 'fatal' and ensures the formatter is called correctly.", () => {
    const meta = { critical: true }
    transport.log(LogLevel.FATAL, 'Critical failure', meta)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.FATAL, 'Critical failure', meta)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.FATAL, message: 'Critical failure', meta })
    )
  })

  it('Logs a message with the lowest possible log level (debug) and verifies the output format.', () => {
    transport.log(LogLevel.DEBUG, 'Low level debug')
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.DEBUG, 'Low level debug', undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.DEBUG, message: 'Low level debug', meta: undefined })
    )
  })

  it('Logs a message with the highest possible log level (fatal) and verifies the output format.', () => {
    transport.log(LogLevel.FATAL, 'High level fatal error')
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.FATAL, 'High level fatal error', undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.FATAL, message: 'High level fatal error', meta: undefined })
    )
  })

  it('Logs a message with an empty string as the message and handles it without errors.', () => {
    transport.log(LogLevel.INFO, '')
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, '', undefined)
    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ level: LogLevel.INFO, message: '', meta: undefined }))
  })

  it('Logs a message with a very long string and ensures it does not crash the application.', () => {
    const longMessage = 'A'.repeat(10000)
    transport.log(LogLevel.INFO, longMessage)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, longMessage, undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: longMessage, meta: undefined })
    )
  })

  it('Logs a message with a null meta parameter and ensures it is handled correctly.', () => {
    transport.log(LogLevel.INFO, 'Message with null meta', null)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, 'Message with null meta', null)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: 'Message with null meta', meta: null })
    )
  })

  it('Logs a message with a complex object as the meta parameter and ensures it is formatted as expected.', () => {
    const complexMeta = { userId: '123', details: { ip: '127.0.0.1', location: 'NY' } }
    transport.log(LogLevel.INFO, 'Message with complex meta', complexMeta)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, 'Message with complex meta', complexMeta)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: 'Message with complex meta', meta: complexMeta })
    )
  })

  it('Logs a message with special characters in the message and verifies the output.', () => {
    const specialMessage = 'Special log message: 💡✨🚀'
    transport.log(LogLevel.INFO, specialMessage)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, specialMessage, undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: specialMessage, meta: undefined })
    )
  })

  it('Logs a message with a non-string type for the message parameter and checks for proper handling.', () => {
    transport.log(LogLevel.INFO, 12345)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, '12345', undefined)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: '12345', meta: undefined })
    )
  })

  it('Logs a message when the formatter is not provided and ensures it throws an appropriate error.', () => {
    expect(() => new JsonTransport(null as unknown as ILogFormatter)).toThrow('A valid formatter must be provided.')
  })

  it('Logs a message with a meta parameter that is an array and verifies the output format.', () => {
    const metaArray = [1, 2, 3]
    transport.log(LogLevel.INFO, 'Message with array meta', metaArray)
    expect(mockFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, 'Message with array meta', metaArray)
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ level: LogLevel.INFO, message: 'Message with array meta', meta: metaArray })
    )
  })

  it('Logs multiple messages in quick succession and ensures that all messages are logged without loss.', () => {
    transport.log(LogLevel.INFO, 'First message')
    transport.log(LogLevel.INFO, 'Second message')
    expect(mockFormatter.format).toHaveBeenCalledTimes(2)
    expect(console.log).toHaveBeenCalledTimes(2)
  })

  it('Logs a message after modifying the formatter to a different implementation and checks if the new format is applied.', () => {
    const newFormatter = {
      format: jest.fn((level, message, meta) => `${level}: ${message} - ${JSON.stringify(meta)}`)
    }
    transport = new JsonTransport(newFormatter)
    transport.log(LogLevel.INFO, 'Message with new format')
    expect(newFormatter.format).toHaveBeenCalledWith(LogLevel.INFO, 'Message with new format', undefined)
    expect(console.log).toHaveBeenCalledWith('info: Message with new format - undefined')
  })
})
