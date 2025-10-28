import { EnvModel } from './env.model';

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvModel {}
  }
}
