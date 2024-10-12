import { ILogContext, ILogger, ILogTransport, LogLevel } from './interface'

export class CircularReferenceDetector {
  private seen = new WeakSet<object>()

  public detect(obj: unknown): unknown {
    return this.replaceCircular(obj)
  }
  private replaceCircular(value: unknown): unknown {
    if (typeof value === 'object' && value !== null) {
      if (this.seen.has(value)) {
        return '[Circular]'
      }
      this.seen.add(value)

      const newValue = Array.isArray(value) ? [] : {}
      for (const [key, val] of Object.entries(value)) {
        (newValue as Record<string, unknown>)[key] = this.replaceCircular(val)
      }
      return newValue
    }
    return value
  }
}

export class Logger implements ILogger {
  private transports: Set<ILogTransport> = new Set()
  private currentLevel: LogLevel = LogLevel.INFO
  private defaultMeta: ILogContext = {}

  constructor(
    defaultMeta?: ILogContext,
    private metaMerger: (defaultMeta: ILogContext, meta?: ILogContext) => ILogContext = (defaultMeta, meta) => ({
      ...defaultMeta,
      ...meta
    }),
    private circularDetector: CircularReferenceDetector = new CircularReferenceDetector()
  ) {
    if (defaultMeta) {
      this.defaultMeta = { ...defaultMeta }
    }
  }

  setDefaultMeta(meta: ILogContext): void {
    this.defaultMeta = { ...this.defaultMeta, ...meta }
  }

  addTransport(transport: ILogTransport): void {
    this.transports.add(transport)
  }

  removeTransport(transport: ILogTransport): void {
    this.transports.delete(transport)
  }

  setLogLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels = [LogLevel.FATAL, LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE]
    const currentIndex = logLevels.indexOf(this.currentLevel)
    const levelIndex = logLevels.indexOf(level)
    return levelIndex <= currentIndex
  }

  private mergeMeta(meta?: ILogContext): ILogContext {
    return this.metaMerger(this.defaultMeta, meta)
  }

  private detectCircularReferences(obj: unknown): unknown {
    return this.circularDetector.detect(obj)
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) {
      return
    }

    const mergedMeta = this.mergeMeta(meta as ILogContext)
    const finalMeta = this.detectCircularReferences(mergedMeta)

    for (const transport of this.transports) {
      try {
        transport.log(level, message, finalMeta)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorMeta: ILogContext = {
          originalMessage: message,
          error
        }
        console.error(`Failed to log message: ${errorMessage}`, errorMeta)
      }
    }
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

  trace(message: string, meta?: unknown): void {
    this.log(LogLevel.TRACE, message, meta)
  }

  fatal(message: string, meta?: unknown): void {
    this.log(LogLevel.FATAL, message, meta)
  }
}
