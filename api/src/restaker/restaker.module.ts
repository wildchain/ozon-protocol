import { Module } from '@nestjs/common';
import { RestakerService } from 'src/restaker/restaker.service';

@Module({
  exports: [RestakerService],
  providers: [RestakerService],
})
export class RestakerModule {}
