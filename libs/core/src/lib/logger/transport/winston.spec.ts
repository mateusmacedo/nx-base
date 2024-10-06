import winston from 'winston'
import { LogLevel } from '../interface'
import { WinstonTransport } from './winston'

jest.mock('winston', () => {
  const originalWinston = jest.requireActual('winston')

  const mockLogger = {
    log: jest.fn()
  }

  const createLogger = jest.fn((options = {}) => {
    if (options.format === 'invalidFormat') {
      throw new Error('Invalid format provided.')
    }
    return mockLogger
  })

  const format = {
    json: jest.fn(() => ({ transform: jest.fn(), formatName: 'mockFormatJson' })),
    simple: jest.fn(() => ({ transform: jest.fn(), formatName: 'mockFormatSimple' }))
  }

  function MockConsoleTransport(this: any) {
    return 'mockConsoleTransport'
  }

  function MockFileTransport(this: any) {
    return 'mockFileTransport'
  }

  const transports = {
    Console: jest.fn().mockImplementation(MockConsoleTransport),
    File: jest.fn().mockImplementation(MockFileTransport)
  }

  return {
    ...originalWinston,
    createLogger,
    format,
    transports
  }
})

describe('WinstonTransport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Instantiate WinstonTransport with no options and verify default log level is "info".', () => {
    new WinstonTransport()
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        format: expect.objectContaining({
          formatName: 'mockFormatJson'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it("Create a WinstonTransport instance with a custom log level of 'error' and verify that the logger's level is set to 'error'.", () => {
    new WinstonTransport({ level: LogLevel.ERROR })
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        format: expect.objectContaining({
          formatName: 'mockFormatJson'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it("Create a WinstonTransport instance with a custom log format of 'simple' and verify that the logger's format is set to 'simple'.", () => {
    new WinstonTransport({ format: winston.format.simple() })
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        format: expect.objectContaining({
          formatName: 'mockFormatSimple'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it('Create a WinstonTransport instance with multiple transports and verify that both transports are configured correctly.', () => {
    new WinstonTransport({
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'test.log' })]
    })
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        format: expect.objectContaining({
          formatName: 'mockFormatJson'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it('Log a message with level "info" using the WinstonTransport instance and verify that the message is logged correctly.', () => {
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log(LogLevel.INFO, 'Test info message')
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', 'Test info message', {
      meta: undefined
    })
  })

  it('Log a message with level "warn" and additional metadata using the WinstonTransport instance and verify that the metadata is included.', () => {
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log(LogLevel.WARN, 'Test warn message', { userId: '123' })
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('warn', 'Test warn message', {
      meta: { userId: '123' }
    })
  })

  it('Instantiate WinstonTransport with an invalid log level and check if it defaults to "info".', () => {
    new WinstonTransport({ level: 'invalid' as LogLevel })
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        format: expect.objectContaining({
          formatName: 'mockFormatJson'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it('Instantiate WinstonTransport with an empty transports array and ensure it uses the default console transport.', () => {
    new WinstonTransport({ transports: [] })
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        format: expect.objectContaining({
          formatName: 'mockFormatJson'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it('Log a message with a level that is not defined in the logger and check if it defaults to "info".', () => {
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log('undefined' as LogLevel, 'Test undefined log level')
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', 'Test undefined log level', {
      meta: undefined
    })
  })

  it('Log a message with an empty string as the message and verify that it does not throw an error.', () => {
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log(LogLevel.INFO, '')
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', '', { meta: undefined })
  })

  it('Log a message with a null meta object and ensure it does not affect the logging process.', () => {
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log(LogLevel.INFO, 'Test message with null meta', null)
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', 'Test message with null meta', {
      meta: null
    })
  })

  it('Instantiate WinstonTransport with a format that is not a valid winston format and check for error handling.', () => {
    const invalidFormat = 'invalidFormat' as unknown as winston.Logform.Format
    expect(() => new WinstonTransport({ format: invalidFormat })).toThrow('Invalid format provided.')
  })

  it('Instantiate WinstonTransport with a very large number of transports and verify that it initializes without errors.', () => {
    const transports = new Array(100).fill(new winston.transports.Console())
    new WinstonTransport({ transports })
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        format: expect.objectContaining({
          formatName: 'mockFormatJson'
        }),
        transports: expect.any(Array)
      })
    )
  })

  it('Log a message with a very long string and check if it is logged correctly without truncation.', () => {
    const longMessage = 'a'.repeat(10000)
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log(LogLevel.INFO, longMessage)
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', longMessage, { meta: undefined })
  })

  it('Log a message with special characters in the message and ensure it is logged without issues.', () => {
    const specialMessage = 'Test with special characters !@#$%^&*()'
    const winstonTransport = new WinstonTransport()
    const createLoggerMock = winston.createLogger as jest.MockedFunction<typeof winston.createLogger>
    const mockLoggerInstance = createLoggerMock.mock.results[0].value
    winstonTransport.log(LogLevel.INFO, specialMessage)
    expect(mockLoggerInstance.log).toHaveBeenCalledWith('info', specialMessage, {
      meta: undefined
    })
  })
})
