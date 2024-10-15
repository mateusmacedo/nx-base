import { Controller, Get, Param } from '@nestjs/common'

import { HelloService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly helloService: HelloService) {}

  @Get('hello/:gender/:name')
  getData(@Param('gender') gender: string, @Param('name') name: string): { message: string } {
    return this.helloService.hello({ gender, name })
  }
}
