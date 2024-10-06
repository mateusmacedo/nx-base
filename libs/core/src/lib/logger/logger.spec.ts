import { ILogContext, ILogTransport, LogLevel } from './interface'
import { Logger } from './logger'

describe('Logger', () => {
  let logger: Logger
  let mockTransport: jest.Mocked<ILogTransport>

  beforeEach(() => {
    mockTransport = {
      log: jest.fn()
    }

    logger = new Logger({ requestId: '123' })
    logger.addTransport(mockTransport)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Happy Path
  it('Logger instance is created with default metadata.', () => {
    expect(logger).toBeDefined()
    expect((logger as unknown as { defaultMeta: Record<string, unknown> }).defaultMeta).toEqual({ requestId: '123' })
  })

  it('Default metadata is updated successfully using setDefaultMeta method.', () => {
    logger.setDefaultMeta({ userId: '456' })
    expect((logger as unknown as { defaultMeta: Record<string, unknown> }).defaultMeta).toEqual({
      requestId: '123',
      userId: '456'
    })
  })

  it('Transport is added successfully using addTransport method.', () => {
    expect((logger as unknown as { transports: ILogTransport[] }).transports).toContain(mockTransport)
  })

  it('Transport is removed successfully using removeTransport method.', () => {
    logger.removeTransport(mockTransport)
    expect((logger as unknown as { transports: ILogTransport[] }).transports).not.toContain(mockTransport)
  })

  it('Log message is sent to all transports at INFO level using info method.', () => {
    logger.info('Test Info Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Test Info Log', { requestId: '123' })
  })

  it('Log message is sent to all transports at ERROR level using error method.', () => {
    logger.error('Test Error Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.ERROR, 'Test Error Log', { requestId: '123' })
  })

  // Edge Cases
  it('Logger initialized without defaultMeta and logs a message.', () => {
    const noMetaLogger = new Logger()
    noMetaLogger.addTransport(mockTransport)
    noMetaLogger.info('No Meta Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'No Meta Log', {})
  })

  it('Logger initialized with an empty defaultMeta and logs a message.', () => {
    const emptyMetaLogger = new Logger({})
    emptyMetaLogger.addTransport(mockTransport)
    emptyMetaLogger.info('Empty Meta Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Empty Meta Log', {})
  })

  it('Logger adds a transport and logs a message with that transport.', () => {
    logger.info('Adding Transport Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Adding Transport Log', { requestId: '123' })
  })

  it('Logger removes a transport and attempts to log a message.', () => {
    logger.removeTransport(mockTransport)
    logger.info('No Transport Log')
    expect(mockTransport.log).not.toHaveBeenCalled()
  })

  it('Logger sets log level to DEBUG and logs a message at INFO level.', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    logger.info('Debug Info Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Debug Info Log', { requestId: '123' })
  })

  it('Logger sets log level to ERROR and logs a message at INFO level.', () => {
    logger.setLogLevel(LogLevel.ERROR)
    logger.info('Should Not Log')
    expect(mockTransport.log).not.toHaveBeenCalled()
  })

  it('Logger merges undefined meta with defaultMeta and logs a message.', () => {
    logger.info('Undefined Meta Log', undefined)
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Undefined Meta Log', { requestId: '123' })
  })

  it('Logger logs a message with null meta.', () => {
    logger.info('Null Meta Log', null)
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Null Meta Log', { requestId: '123' })
  })

  it('Logger logs a message with an empty string as the message.', () => {
    logger.info('')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, '', { requestId: '123' })
  })

  it('Logger logs a message with a very large string as the message.', () => {
    const largeMessage = 'A'.repeat(10000)
    logger.info(largeMessage)
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, largeMessage, { requestId: '123' })
  })

  it('Logger logs a message with a meta object containing circular references.', () => {
    const circularMeta: ILogContext = { key: 'value' }
    circularMeta['self'] = circularMeta // Circular reference
    expect(() => logger.info('Circular Meta Log', circularMeta)).not.toThrow()
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'Circular Meta Log', {
      requestId: '123',
      key: 'value',
      self: {
        key: 'value',
        self: '[Circular]'
      }
    })
  })

  it('Logger logs a message with a meta object that has no properties.', () => {
    logger.info('No Props Meta Log', {})
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.INFO, 'No Props Meta Log', { requestId: '123' })
  })

  it('Log message is sent to all transports at WARN level using warn method.', () => {
    logger.warn('Test Warn Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.WARN, 'Test Warn Log', { requestId: '123' })
  })

  it('Log message is sent to all transports at DEBUG level using debug method.', () => {
    logger.setLogLevel(LogLevel.DEBUG) // Definir o nível de log como DEBUG
    logger.debug('Test Debug Log')
    expect(mockTransport.log).toHaveBeenCalledWith(LogLevel.DEBUG, 'Test Debug Log', { requestId: '123' })
  })
})
