import { ILogFormatter, ILogTransport, LogLevel } from '../interface'

export interface IWritable {
  write(chunk: unknown, encoding?: string, callback?: (error: Error | null) => void): boolean
}

export interface IAsyncWritable {
  write(chunk: unknown, encoding?: string): Promise<void>
}

export type TWritable = IWritable | IAsyncWritable

export interface DefaultTransportOptions {
  formatter: ILogFormatter
  writeable?: TWritable
}

export class DefaultTransport implements ILogTransport {
  private formatter: ILogFormatter
  private output: TWritable

  constructor(options: DefaultTransportOptions) {
    if (!options.formatter) {
      throw new Error('A valid formatter must be provided.')
    }
    this.formatter = options.formatter
    this.output = options.writeable || (process.stdout as TWritable)
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
