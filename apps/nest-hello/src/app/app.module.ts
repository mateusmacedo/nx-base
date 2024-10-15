import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { GenderHandler, TimeHandler } from './app.handler'
import { GreetingMediator } from './app.mediator'
import { HelloService } from './app.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    { provide: 'TimeHandler', useClass: TimeHandler },
    { provide: 'GenderHandler', useClass: GenderHandler },
    { provide: 'GreetingMediator', useClass: GreetingMediator },
    HelloService
  ]
})
export class AppModule {}
