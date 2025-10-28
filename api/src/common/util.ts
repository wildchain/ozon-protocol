import { Wallet } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import {
  OzonTokenAddressConfigModel,
  OzonTokenAddressConfigModelsMap,
  OzonTokenName,
} from 'src/common/constants';
import { EnvironmentName } from 'src/config/env';

export function getAdminWallet() {
  const ENV_KEY_PAIR_ARRAY_STRING = process.env.WALLET_KEY_PAIR;
  if (!ENV_KEY_PAIR_ARRAY_STRING) {
    throw new Error('WALLET_KEY_PAIR is not set');
  }
  const ENV_KEY_PAIR_ARRAY = JSON.parse(ENV_KEY_PAIR_ARRAY_STRING);

  const keypair = Keypair.fromSecretKey(new Uint8Array(ENV_KEY_PAIR_ARRAY));

  // Get your public key (wallet address)
  const publicKey = keypair.publicKey.toString();
  return {
    publicKey,
    anchorWallet: new Wallet(keypair),
  };
}

const LAMPORTS_PER_SOL = 1_000_000_000;

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * This is a helper function to get the token address configuration for a given token name and environment.
 * @param name - The name of the token.
 * @param environment - The environment to get the token address configuration for. If not provided, the environment will be taken from the process.env.APPLICATION_ENVIRONMENT.
 * @returns The token address configuration.
 */
export function getTokenAddressConfig(
  name: OzonTokenName,
  environment?: EnvironmentName,
): OzonTokenAddressConfigModel {
  const config = OzonTokenAddressConfigModelsMap?.[name];
  if (!config) {
    throw new Error(`Token address config not found for ${name}`);
  }
  let environmentToGet = environment || process.env.APPLICATION_ENVIRONMENT;
  if (environmentToGet === 'staging' || !environmentToGet) {
    environmentToGet = EnvironmentName.DEVELOPMENT;
  }
  return config[environmentToGet];
}
