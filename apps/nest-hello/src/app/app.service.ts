import { IMediator } from '@mmda/core'
import { Inject, Injectable } from '@nestjs/common'

export type HelloResponse = { message: string }

export type HelloRequest = { gender: string; name: string }

@Injectable()
export class HelloService {
  private readonly mediator: IMediator<HelloRequest, HelloResponse>

  constructor(@Inject('GreetingMediator') mediator: IMediator<HelloRequest, HelloResponse>) {
    this.mediator = mediator
  }

  hello(request: HelloRequest): HelloResponse {
    const greetingMsg = this.mediator.mediate(request)
    return { message: `${greetingMsg.message} ${request.name}` }
  }
}
