import pino from 'pino'
import { ILogTransport, LogLevel } from '../interface'

export interface PinoTransportOptions {
  level?: LogLevel
  transport?: pino.TransportSingleOptions
  destination?: pino.DestinationStream | undefined
}

export class PinoTransport implements ILogTransport {
  private pinoLogger: pino.Logger

  constructor(options: PinoTransportOptions = {}) {
    const { level = LogLevel.INFO, transport, destination } = options
    const logLevel = this.mapLogLevel(level)
    this.pinoLogger = pino(
      {
        level: logLevel,
        transport
      },
      destination
    )
  }

  private mapLogLevel(level: LogLevel): pino.LevelWithSilent {
    const levelMapping: Record<LogLevel, pino.LevelWithSilent> = {
      [LogLevel.FATAL]: 'fatal',
      [LogLevel.ERROR]: 'error',
      [LogLevel.WARN]: 'warn',
      [LogLevel.INFO]: 'info',
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.TRACE]: 'trace'
    }
    return levelMapping[level] || 'info'
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    const logLevel = this.mapLogLevel(level)
    this.pinoLogger[logLevel](meta, message)
  }
}
