import winston from 'winston'
import { ILogTransport, LogLevel } from '../interface'

export interface WinstonTransportOptions {
  level?: LogLevel
  format?: winston.Logform.Format
  transports?: winston.transport[]
}

export class WinstonTransport implements ILogTransport {
  private winstonLogger: winston.Logger

  constructor(options: WinstonTransportOptions = {}) {
    const {
      level = LogLevel.INFO,
      format = winston.format.json(),
      transports = [new winston.transports.Console()]
    } = options

    const validLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const loggerLevel = validLevels.includes(level) ? level : 'info'

    if (!format || typeof format.transform !== 'function') {
      throw new Error('Invalid format provided.')
    }

    const loggerTransports = transports && transports.length > 0 ? transports : [new winston.transports.Console()]

    this.winstonLogger = winston.createLogger({
      level: loggerLevel,
      format,
      transports: loggerTransports
    })
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    const validLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const logLevel = validLevels.includes(level) ? level : LogLevel.INFO
    this.winstonLogger.log(logLevel, message, { meta })
  }
}
