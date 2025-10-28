import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto';
import {
  getTransactions,
  getUnstakedUnclaimedTransactions,
} from 'src/restaking/repositories/transaction.repository';

@Controller('/transactions')
export class TransactionController {
  @Get('/')
  async getTransactions(@Query() dto: PaginationDto) {
    return getTransactions(dto);
  }

  @Get('/unstaked-unclaimed/:address')
  async getUnstakedUnclaimedTransactions(
    @Param('address') address: string,
    @Query() dto: PaginationDto,
  ) {
    return getUnstakedUnclaimedTransactions(address, dto);
  }
}
