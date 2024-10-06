import pino from 'pino'
import { ILogTransport, LogLevel } from '../interface'

export interface PinoTransportOptions {
  level?: LogLevel
  transport?: pino.TransportSingleOptions
  destination?: pino.DestinationStream
}

const validLevels: LogLevel[] = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]

export class PinoTransport implements ILogTransport {
  private pinoLogger: pino.Logger

  constructor(options: PinoTransportOptions = {}) {
    const { level = LogLevel.INFO, transport, destination } = options
    const logLevel = validLevels.includes(level) ? level : LogLevel.INFO
    this.pinoLogger = pino(
      {
        level: logLevel,
        transport
      },
      destination
    )
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    const logMethod = validLevels.includes(level) ? level : LogLevel.INFO
    const safeMessage = message ?? ''
    this.pinoLogger[logMethod](meta, safeMessage)
  }
}
