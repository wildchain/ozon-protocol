import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from 'src/config/env';
import { RestakingModule } from 'src/restaking/restaking.module';
import { TransactionListener } from 'src/restaking/listeners/transaction.listener';

@Module({
  imports: [AuthModule, RestakingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly transactionListener: TransactionListener) {}
  async onApplicationBootstrap() {
    validateEnv();
    this.transactionListener.listen();
  }
}
