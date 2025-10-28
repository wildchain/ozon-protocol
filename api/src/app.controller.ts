import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { OzonTokenAddressConfigModelsMap } from 'src/common/constants';

@Controller()
export class AppController {
  @Get('/token-address-config-map')
  async getTokenAddressConfigMap() {
    return OzonTokenAddressConfigModelsMap;
  }
}
