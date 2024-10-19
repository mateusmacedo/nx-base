export enum LogLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface IBaseLogger {
  log(level: LogLevel, message: string, meta?: unknown): void
  info(message: string, meta?: unknown): void
  error(message: string, meta?: unknown): void
  warn(message: string, meta?: unknown): void
  debug(message: string, meta?: unknown): void
  trace(message: string, meta?: unknown): void
  fatal(message: string, meta?: unknown): void
}

export interface ILogTransport {
  log(level: LogLevel, message: string, meta?: unknown): void
}

export interface ILogFormatter {
  format(level: LogLevel, message: string, meta?: unknown): string
}

export interface ILogger extends IBaseLogger {
  addTransport(transport: ILogTransport): void
  removeTransport(transport: ILogTransport): void
  setLogLevel(level: LogLevel): void
  setDefaultMeta(meta: ILogContext): void
}

export interface ILogContext {
  requestId?: string
  userId?: string
  transactionId?: string
  [key: string]: unknown
}
