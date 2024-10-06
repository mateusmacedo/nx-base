import { ILogFormatter, LogLevel } from '../interface'

export class JsonFormatter implements ILogFormatter {
  format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString()
    const pid = process.pid

    const logEntry = {
      level,
      message: message !== undefined ? message : 'undefined', // Tratar caso undefined
      meta: typeof meta === 'object' && meta !== null ? this.replaceCircular(meta) : {},
      timestamp,
      pid
    }

    return JSON.stringify(logEntry)
  }

  private replaceCircular(obj: unknown): unknown {
    const seen = new WeakSet<object>()

    const traverse = (value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            (value as Record<string, unknown>)[key] = traverse((value as Record<string, unknown>)[key])
          }
        }
      }
      return value
    }

    return traverse(obj)
  }
}
