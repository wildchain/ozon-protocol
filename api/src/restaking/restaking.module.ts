import { Module } from '@nestjs/common';
import { TransactionListener } from 'src/restaking/listeners/transaction.listener';
import { TransactionController } from 'src/restaking/controllers/transaction.controller';

@Module({
  exports: [TransactionListener],
  providers: [TransactionListener],
  controllers: [TransactionController],
})
export class RestakingModule {}
