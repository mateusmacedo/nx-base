import { ILogContext, ILogger, ILogTransport, LogLevel } from './interface'
export class Logger implements ILogger {
  private transports: ILogTransport[] = []
  private currentLevel: LogLevel = LogLevel.INFO
  private defaultMeta: ILogContext = {}

  constructor(defaultMeta?: ILogContext) {
    if (defaultMeta) {
      this.defaultMeta = defaultMeta
    }
  }

  setDefaultMeta(meta: ILogContext): void {
    this.defaultMeta = { ...this.defaultMeta, ...meta }
  }

  addTransport(transport: ILogTransport): void {
    this.transports.push(transport)
  }

  removeTransport(transport: ILogTransport): void {
    this.transports = this.transports.filter((t) => t !== transport)
  }

  setLogLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels = Object.values(LogLevel)
    const currentIndex = logLevels.indexOf(this.currentLevel)
    const levelIndex = logLevels.indexOf(level)
    return levelIndex >= currentIndex
  }

  private mergeMeta(meta?: unknown): ILogContext {
    if (typeof meta === 'object' && meta !== null) {
      return { ...this.defaultMeta, ...(meta as ILogContext) }
    }
    return this.defaultMeta
  }

  private detectCircularReferences(obj: ILogContext): ILogContext {
    const seen = new WeakSet<object>()

    const replaceCircular = (value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)

        Object.keys(value).forEach((key) => {
          const propValue = (value as ILogContext)[key]
          ;(value as ILogContext)[key] = replaceCircular(propValue) as ILogContext[keyof ILogContext]
        })
      }
      return value
    }

    // Retorna o objeto processado, com todas as referências circulares substituídas
    return replaceCircular(obj) as ILogContext
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) {
      return
    }

    const mergedMeta = this.mergeMeta(meta)
    const finalMeta = this.detectCircularReferences(mergedMeta)
    this.transports.forEach((transport) => {
      transport.log(level, message, finalMeta)
    })
  }

  info(message: string, meta?: unknown): void {
    this.log(LogLevel.INFO, message, meta)
  }

  error(message: string, meta?: unknown): void {
    this.log(LogLevel.ERROR, message, meta)
  }

  warn(message: string, meta?: unknown): void {
    this.log(LogLevel.WARN, message, meta)
  }

  debug(message: string, meta?: unknown): void {
    this.log(LogLevel.DEBUG, message, meta)
  }
}
