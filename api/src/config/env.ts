import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsString,
  validateSync,
} from 'class-validator';

export interface EnvModel {
  WALLET_KEY_PAIR: string;
  RESTAKED_TOKEN_MINT_ADDRESS: string;
}

export enum EnvironmentName {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
}

export class EnvModel implements EnvModel {
  @IsString()
  @IsNotEmpty()
  @IsJSON()
  WALLET_KEY_PAIR: string;
  @IsString()
  @IsNotEmpty()
  @IsString()
  RESTAKED_TOKEN_MINT_ADDRESS: string;

  @IsEnum(EnvironmentName)
  @IsNotEmpty()
  APPLICATION_ENVIRONMENT: EnvironmentName;

  constructor(record: Record<string, string>) {
    Object.assign(this, record);
  }
}

export function validateEnv() {
  try {
    const environmentVariables = new EnvModel(process.env);
    const errors = validateSync(environmentVariables);
    if (errors.length > 0) {
      console.error('Error initializing environment variables', errors);
      process.exit(1);
    }
    return environmentVariables;
  } catch (error) {
    console.error('Error initializing environment variables', error);
    process.exit(1);
  }
}
