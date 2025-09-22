import { BuildConfig } from './build-config.interface';

export interface BuildVars {
  debug: boolean;
  buildTimestamp: string;
  commitShortSha: string;
  config: BuildConfig;
}
