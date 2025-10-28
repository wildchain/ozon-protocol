import { PublicKey } from '@solana/web3.js';
import { EnvironmentName } from 'src/config/env';

export class OzonTokenAddressConfigModel {
  mintAddress: string;
  publicKey: PublicKey;
  name: string;

  constructor({ mintAddress, name }: { mintAddress: string; name: string }) {
    this.mintAddress = mintAddress;
    this.publicKey = new PublicKey(mintAddress);
    this.name = name;
  }
  toJSON() {
    return {
      mintAddress: this.mintAddress,
      name: this.name,
      publicKey: this.mintAddress,
    };
  }
}

/**
 * This enum represents the names of the tokens used in the Ozon protocol.
 */
export enum OzonTokenName {
  /**
   * This stands for Receipt-Sol and is the token issued after staking SOL on the Ozon protocol.
   */
  RMSOL = 'RMSOL',
  MSOL = 'MSOL',
  JITOSOL = 'JITOSOL',
  /**
   * This stands for Receipt-Jito-Sol and is the token issued after staking Jito-Sol on the Ozon protocol.
   */
  RJITOSOL = 'RJITOSOL',
}

/**
 * This map contains the configuration for the tokens used in the Ozon protocol mapped by the token name and the environment.
 */
export const OzonTokenAddressConfigModelsMap: Partial<
  Record<
    OzonTokenName,
    Partial<Record<EnvironmentName, OzonTokenAddressConfigModel>>
  >
> = {
  [OzonTokenName.RMSOL]: {
    [EnvironmentName.DEVELOPMENT]: new OzonTokenAddressConfigModel({
      mintAddress: 'Dnc6QpqsSfrte1jB8beiGAByzY1N4yXsHZwjECm5ncJF',
      name: OzonTokenName.RMSOL,
    }),
  },
  [OzonTokenName.MSOL]: {
    [EnvironmentName.DEVELOPMENT]: new OzonTokenAddressConfigModel({
      mintAddress: 'GAsRdFhAmKLZJYc7hGzhyP1R1ee94ZqH3TyfMzvdQtek',
      name: OzonTokenName.MSOL,
    }),
  },
  [OzonTokenName.JITOSOL]: {
    [EnvironmentName.DEVELOPMENT]: new OzonTokenAddressConfigModel({
      mintAddress: 'EedVL8gV9ALoq4Bj2NmJNa3QU6q339C8Nk5WEdHSfGZE',
      name: OzonTokenName.JITOSOL,
    }),
  },
  [OzonTokenName.RJITOSOL]: {
    [EnvironmentName.DEVELOPMENT]: new OzonTokenAddressConfigModel({
      mintAddress: 'EXj4ip8vTaCsSiV8xU53dd8Qguts8KEW44H6mfn2kTX5',
      name: OzonTokenName.RJITOSOL,
    }),
  },
};

export function getTokenConfigFromAddress(address: string) {
  if (address) {
    throw new Error('Address is required');
  }
  for (const environemntConfigMap of Object.values(
    OzonTokenAddressConfigModelsMap,
  )) {
    const currentEnvironment =
      process.env.APPLICATION_ENVIRONMENT || EnvironmentName.DEVELOPMENT;
    for (const [environment, config] of Object.entries(environemntConfigMap)) {
      if (environment !== currentEnvironment) {
        continue;
      }
      if (config.publicKey.toString().toLowerCase() === address.toLowerCase()) {
        return config;
      }
    }
  }
}

/**
 * This array represents the tokens that are eligible for staking on the Ozon protocol. This will eventually be needed to be migrated to database
 */
export const ELIGIBLE_STAKING_TOKENS = [
  OzonTokenName.JITOSOL,
  OzonTokenName.MSOL,
] as const;

export const RECEIPT_TOKENS = [
  OzonTokenName.RMSOL,
  OzonTokenName.RJITOSOL,
] as const;
