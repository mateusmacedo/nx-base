import { ILogFormatter, ILogTransport, LogLevel } from '../interface'

export class JsonTransport implements ILogTransport {
  private formatter: ILogFormatter

  constructor(formatter: ILogFormatter) {
    if (!formatter) {
      throw new Error('A valid formatter must be provided.')
    }
    this.formatter = formatter
  }

  log(level: LogLevel, message: string | unknown, meta?: unknown): void {
    const formattedMessage = this.formatter.format(level, String(message), meta)
    console.log(formattedMessage)
  }
}
