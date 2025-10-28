import { AuthService } from 'src/auth/auth.service';
import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { IsString, IsEnum } from 'class-validator';
import { AccountType } from 'src/common/types';

export class AuthenticateDto {
  @IsString()
  address: string;

  // @IsEnum(['operator', 'restaker'])
  // accountType: AccountType;

  // @IsString()
  // signature: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('message')
  async requestSignatureMessage(@Query('address') address: string) {
    return this.authService.requestSignatureMessage(address);
  }

  @Post('authenticate')
  async authenticateUser(
    @Body(ValidationPipe) authenticateDto: AuthenticateDto,
  ) {
    // const { address, accountType, signature } = authenticateDto;
    return this.authService.authenticateUser(authenticateDto.address);
  }
}
