import { Writable } from 'stream'
import { ILogFormatter, ILogTransport, LogLevel } from '../interface'

export interface JsonTransportOptions {
  formatter: ILogFormatter
  output?: Writable
}

export class JsonTransport implements ILogTransport {
  private formatter: ILogFormatter
  private output: Writable

  constructor(options: JsonTransportOptions) {
    if (!options.formatter) {
      throw new Error('A valid formatter must be provided.')
    }
    this.formatter = options.formatter
    this.output = options.output || process.stdout
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    try {
      const formattedMessage = this.formatter.format(level, message, meta)
      this.output.write(formattedMessage)
    } catch (error) {
      this.output.write(`Error formatting log message: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
