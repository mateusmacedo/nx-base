import pino from 'pino'
import { ILogTransport, LogLevel } from '../interface'

export interface PinoTransportOptions {
  level?: LogLevel // Permite configurar o nível de log
  transport?: pino.TransportSingleOptions // Permite configurar transportes como pino-pretty
  destination?: pino.DestinationStream // Permite configurar o destino dos logs (arquivo, HTTP, etc.)
}

const validLevels: LogLevel[] = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]

export class PinoTransport implements ILogTransport {
  private pinoLogger: pino.Logger

  constructor(options: PinoTransportOptions = {}) {
    const { level = LogLevel.INFO, transport, destination } = options

    // Validação para o nível de log - Se for inválido, usamos 'info'
    const logLevel = validLevels.includes(level) ? level : LogLevel.INFO

    // Criação do logger Pino com opções flexíveis
    this.pinoLogger = pino(
      {
        level: logLevel, // Nível de log validado
        transport // Configuração do transporte, como pino-pretty
      },
      destination
    ) // Configuração do destino, como arquivos ou streams
  }

  log(level: LogLevel, message: string, meta?: unknown): void {
    const logMethod = validLevels.includes(level) ? level : LogLevel.INFO

    // Se a mensagem for null ou undefined, trata como string vazia
    const safeMessage = message ?? ''

    this.pinoLogger[logMethod](meta, safeMessage)
  }
}
