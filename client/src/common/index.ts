export enum EnvironmentName {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
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
