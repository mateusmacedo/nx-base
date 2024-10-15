import { IHandler } from '@mmda/core'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TimeHandler implements IHandler<number, string> {
  handle(msg: number): string {
    if (msg >= 0 && msg < 12) {
      return 'Good morning'
    } else if (msg >= 12 && msg < 18) {
      return 'Good afternoon'
    } else {
      return 'Good evening'
    }
  }
}

@Injectable()
export class GenderHandler implements IHandler<string, string> {
  handle(msg: string): string {
    const isInvalidMsg = !['M', 'F'].includes(msg)

    if (isInvalidMsg) throw new Error('Gender Invalid')

    if (msg === 'M') {
      return 'Mr.'
    }

    return 'Ms.'
  }
}
