import { IsNumber, IsOptional } from 'class-validator';

export class TokenConfig {
  tokenMintAddress: string;
  restakedTokenMintAddress: string;
}

export enum TokenName {
  RM_SOL = 'rmSol',
  R_SOL = 'rSol',
}

export class OzonConfig {}

export class PaginationDto {
  @IsNumber()
  @IsOptional()
  page: number = 1;
  @IsNumber()
  @IsOptional()
  limit: number = 20;

  constructor(page: number = 1, limit: number = 20) {
    this.page = page;
    this.limit = limit;
  }
}
