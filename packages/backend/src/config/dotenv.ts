import path from 'path';
import { IS_DEV } from './app';

const devEnvPath = path.join(__dirname, '../../.env.development');
const prodEnvPath = path.join(__dirname, '../../.env.production');

console.log({ IS_DEV });

export const dotenvConfig = {
  path: IS_DEV ? devEnvPath : prodEnvPath,
};
