import path from 'path';
import { IS_DEV } from './app';

const devEnvPath = path.resolve(process.cwd(), '.env.development');
const prodEnvPath = path.resolve(process.cwd(), '.env.production');

export const dotenvConfig = {
  path: IS_DEV ? devEnvPath : prodEnvPath,
};
