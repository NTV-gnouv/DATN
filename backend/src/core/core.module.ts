import { Global, Module } from '@nestjs/common';

import { ConfigServiceCore } from './config/config.service';
import { DatabaseService } from './database/database.service';
import { AppLoggerService } from './logger/app-logger.service';

@Global()
@Module({
  providers: [ConfigServiceCore, DatabaseService, AppLoggerService],
  exports: [ConfigServiceCore, DatabaseService, AppLoggerService],
})
export class CoreModule {}
