import { IHandler, IMediator } from '@mmda/core'
import { Inject, Injectable } from '@nestjs/common'
import { HelloRequest, HelloResponse } from './app.service'

@Injectable()
export class GreetingMediator implements IMediator<HelloRequest, HelloResponse> {
  constructor(
    @Inject('TimeHandler') private readonly timeHandler: IHandler<number, string>,
    @Inject('GenderHandler') private readonly genderHandler: IHandler<string, string>
  ) {}

  mediate(msg: HelloRequest): HelloResponse {
    const { gender } = msg
    const dayPeridod = new Date().getHours()
    const timeResponse = this.timeHandler.handle(dayPeridod)
    const treatement = this.genderHandler.handle(gender)

    return { message: `${timeResponse} ${treatement}` }
  }
}
