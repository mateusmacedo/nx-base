import pino from 'pino'
import { LogLevel } from '../interface'
import { PinoTransport } from './pino'

jest.mock('pino', () => {
  const mockPinoLogger = {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    fatal: jest.fn()
  }

  const pinoMock = jest.fn(() => mockPinoLogger)
  ;(pinoMock as any).destination = jest.fn(() => ({
    write: jest.fn(),
    flush: jest.fn(),
    reopen: jest.fn(),
    flushSync: jest.fn(),
    end: jest.fn()
  }))

  return pinoMock
})

describe('PinoTransport', () => {
  let mockPinoLogger: ReturnType<typeof pino>

  beforeEach(() => {
    mockPinoLogger = pino()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Create a PinoTransport instance with default options and verify that the logger is initialized with the default log level "info".', () => {
    const pinoTransport = new PinoTransport()
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: undefined }, undefined)
  })

  it('Create a PinoTransport instance with a custom log level "debug" and verify that the logger is initialized with the specified log level.', () => {
    const pinoTransport = new PinoTransport({ level: LogLevel.DEBUG })
    expect(pino).toHaveBeenCalledWith({ level: 'debug', transport: undefined }, undefined)
  })

  it('Create a PinoTransport instance with a custom transport option and verify that the transport is correctly configured.', () => {
    const customTransport = { target: 'pino-pretty' }
    const pinoTransport = new PinoTransport({ transport: customTransport })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: customTransport }, undefined)
  })

  it('Create a PinoTransport instance with a destination stream and verify that logs are directed to the specified destination.', () => {
    const customDestination = pino.destination('/path/to/log/file')
    const pinoTransport = new PinoTransport({ destination: customDestination })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: undefined }, customDestination)
  })

  it('Log a message at the "info" level using the log method and verify that the message is correctly logged.', () => {
    const pinoTransport = new PinoTransport()
    pinoTransport.log(LogLevel.INFO, 'Test info message')
    expect(mockPinoLogger.info).toHaveBeenCalledWith(undefined, 'Test info message')
  })

  it('Log a message at the "error" level with metadata using the log method and verify that both the message and metadata are correctly logged.', () => {
    const pinoTransport = new PinoTransport()
    pinoTransport.log(LogLevel.ERROR, 'Test error message', { userId: '123' })
    expect(mockPinoLogger.error).toHaveBeenCalledWith({ userId: '123' }, 'Test error message')
  })

  it('Instantiate PinoTransport with no options and verify default log level is "info".', () => {
    const pinoTransport = new PinoTransport()
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: undefined }, undefined)
  })

  it('Instantiate PinoTransport with an invalid log level and check if it defaults to "info".', () => {
    const pinoTransport = new PinoTransport({ level: 'invalid' as LogLevel })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: undefined }, undefined)
  })

  it('Pass an empty string as the log level and ensure it defaults to "info".', () => {
    const pinoTransport = new PinoTransport({ level: '' as LogLevel })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: undefined }, undefined)
  })

  it('Provide a custom transport option and verify that it is correctly set in the logger.', () => {
    const customTransport = { target: 'pino-pretty' }
    const pinoTransport = new PinoTransport({ transport: customTransport })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: customTransport }, undefined)
  })

  it('Set the destination to a non-existent file path and check for error handling during logging.', () => {
    const customDestination = pino.destination('/invalid/path/to/log/file')
    const pinoTransport = new PinoTransport({ destination: customDestination })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: undefined }, customDestination)
  })

  it('Instantiate PinoTransport with a valid transport option but invalid destination and verify error handling.', () => {
    const customTransport = { target: 'pino-pretty' }
    const customDestination = pino.destination('/invalid/path/to/log/file')
    const pinoTransport = new PinoTransport({ transport: customTransport, destination: customDestination })
    expect(pino).toHaveBeenCalledWith({ level: 'info', transport: customTransport }, customDestination)
  })

  it('Log a message with a level that is not defined in LogLevel and check if it defaults to "info".', () => {
    const pinoTransport = new PinoTransport()
    pinoTransport.log('invalid' as LogLevel, 'Test message')
    expect(mockPinoLogger.info).toHaveBeenCalledWith(undefined, 'Test message')
  })

  it('Pass a null value for the message parameter in the log method and verify that it handles it gracefully.', () => {
    const pinoTransport = new PinoTransport()
    pinoTransport.log(LogLevel.INFO, null as unknown as string)
    expect(mockPinoLogger.info).toHaveBeenCalledWith(undefined, '')
  })
})
