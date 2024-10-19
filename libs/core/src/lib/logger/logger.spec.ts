import { ILogTransport, LogLevel } from './interface'
import { CircularReferenceDetector, Logger } from './logger'

describe('Logger', () => {
  let logger: Logger
  let mockTransport: jest.Mocked<ILogTransport>
  let circularReferenceDetector: CircularReferenceDetector
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

  beforeEach(() => {
    mockTransport = { log: jest.fn() } as jest.Mocked<ILogTransport>
    circularReferenceDetector = new CircularReferenceDetector()
    logger = new Logger(
      { requestId: '123' },
      (defaultMeta, meta) => ({ ...defaultMeta, ...meta }),
      circularReferenceDetector
    )
    logger.addTransport(mockTransport)
  })

  afterEach(() => {
    consoleErrorSpy.mockClear()
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  const expectLogCall = (
    transport: jest.Mocked<ILogTransport>,
    level: LogLevel,
    message: string,
    meta: Record<string, unknown>
  ) => {
    expect(transport.log).toHaveBeenCalledWith(level, message, meta)
  }

  it('should create a Logger instance with default metadata', () => {
    expect(logger).toBeDefined()
    expect((logger as any).defaultMeta).toEqual({ requestId: '123' })
  })

  it('should update default metadata using setDefaultMeta method', () => {
    logger.setDefaultMeta({ userId: '456' })
    expect((logger as any).defaultMeta).toEqual({ requestId: '123', userId: '456' })
  })

  it('should add a transport using addTransport method', () => {
    expect((logger as any).transports).toContain(mockTransport)
  })

  it('should remove a transport using removeTransport method', () => {
    logger.removeTransport(mockTransport)
    expect((logger as any).transports).not.toContain(mockTransport)
  })

  it('should not log if log level is too low', () => {
    logger.setLogLevel(LogLevel.ERROR)
    logger.info('This should not be logged')

    expect(mockTransport.log).not.toHaveBeenCalled()
  })

  it('should send log message to all transports at INFO level using info method', () => {
    logger.info('Test Info Log')
    expectLogCall(mockTransport, LogLevel.INFO, 'Test Info Log', { requestId: '123' })
  })

  it('should send log message to all transports at ERROR level using error method', () => {
    logger.error('Test Error Log')
    expectLogCall(mockTransport, LogLevel.ERROR, 'Test Error Log', { requestId: '123' })
  })

  it('should log at WARN level using warn method', () => {
    logger.warn('Test Warn Log')
    expectLogCall(mockTransport, LogLevel.WARN, 'Test Warn Log', { requestId: '123' })
  })

  it('should log at DEBUG level using debug method', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    logger.debug('Test Debug Log')
    expectLogCall(mockTransport, LogLevel.DEBUG, 'Test Debug Log', { requestId: '123' })
  })

  it('should log at TRACE level using trace method', () => {
    logger.setLogLevel(LogLevel.TRACE)
    logger.trace('Test Trace Log')
    expectLogCall(mockTransport, LogLevel.TRACE, 'Test Trace Log', { requestId: '123' })
  })

  it('should log at FATAL level using fatal method', () => {
    logger.fatal('Test Fatal Log')
    expectLogCall(mockTransport, LogLevel.FATAL, 'Test Fatal Log', { requestId: '123' })
  })

  it('should log a message with a meta object containing circular references', () => {
    const circularMeta: any = { key: 'value', requestId: '123', self: undefined }
    circularMeta.self = circularMeta

    logger.info('Circular Meta Log', circularMeta)

    expectLogCall(mockTransport, LogLevel.INFO, 'Circular Meta Log', {
      key: 'value',
      requestId: '123',
      self: {
        key: 'value',
        requestId: '123',
        self: '[Circular]'
      }
    })
  })

  describe('Circular Reference Detector', () => {
    it('should handle circular references in objects', () => {
      const circularObj: Record<string, unknown> = { key: 'value' }
      circularObj['self'] = circularObj
      const result = circularReferenceDetector.detect(circularObj)
      expect(result).toEqual({ key: 'value', self: '[Circular]' })
    })

    it('should handle circular references in arrays', () => {
      const circularArray: unknown[] = ['value']
      circularArray.push(circularArray)
      const result = circularReferenceDetector.detect(circularArray)
      expect(result).toEqual(['value', '[Circular]'])
    })

    it('should handle nested circular references', () => {
      const nestedCircularObj: Record<string, any> = { key: { nestedKey: 'nestedValue' } }
      nestedCircularObj.key.self = nestedCircularObj
      const result = circularReferenceDetector.detect(nestedCircularObj)
      expect(result).toEqual({ key: { nestedKey: 'nestedValue', self: '[Circular]' } })
    })

    it('should handle non-circular objects', () => {
      const nonCircularObj = { key: 'value' }
      const result = circularReferenceDetector.detect(nonCircularObj)
      expect(result).toEqual(nonCircularObj)
    })

    it('should handle non-circular arrays', () => {
      const nonCircularArray = ['value']
      const result = circularReferenceDetector.detect(nonCircularArray)
      expect(result).toEqual(nonCircularArray)
    })

    it('should handle primitive values', () => {
      const primitiveValue = 'string'
      const result = circularReferenceDetector.detect(primitiveValue)
      expect(result).toEqual(primitiveValue)
    })
  })

  it('should use metaMerger and circularDetector correctly', () => {
    const customMetaMerger = jest.fn().mockImplementation((defaultMeta, meta) => ({ ...defaultMeta, ...meta }))
    const customCircularDetector = new CircularReferenceDetector()

    const customLogger = new Logger({ requestId: '123' }, customMetaMerger, customCircularDetector)
    customLogger.info('Test message', { userId: '456' })

    expect(customMetaMerger).toHaveBeenCalledWith({ requestId: '123' }, { userId: '456' })
  })

  describe('Error Handling', () => {
    it('should handle error thrown by transport and log error message', () => {
      logger.removeTransport(mockTransport)

      const errorTransport: jest.Mocked<ILogTransport> = {
        log: jest.fn().mockImplementation(() => {
          throw new Error('Transport Error')
        })
      }

      logger.addTransport(errorTransport)
      logger.info('Test Error Handling Log')

      expectLogCall(errorTransport, LogLevel.INFO, 'Test Error Handling Log', { requestId: '123' })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log message: Transport Error', {
        originalMessage: 'Test Error Handling Log',
        error: new Error('Transport Error')
      })
    })

    it('should handle unknown error thrown by transport and log error message', () => {
      logger.removeTransport(mockTransport)

      const unknownErrorTransport: jest.Mocked<ILogTransport> = {
        log: jest.fn().mockImplementation(() => {
          throw 'Unknown Error'
        })
      }

      logger.addTransport(unknownErrorTransport)
      logger.info('Test Unknown Error Handling Log')

      expectLogCall(unknownErrorTransport, LogLevel.INFO, 'Test Unknown Error Handling Log', { requestId: '123' })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log message: Unknown error', {
        originalMessage: 'Test Unknown Error Handling Log',
        error: 'Unknown Error'
      })
    })
  })
})
