/// <reference types="vite/client" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default defineConfig(({ mode }) => {
  const localIp = getIPv4Address();
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (env.VITE_REPLACE_NETWORK_IP === 'true') {
    console.log(`Replacing VITE_BE_HOST with Network IP in .env.${mode}`);
    const host = `http://${localIp}`;
    env.VITE_BE_HOST = host;
    setEnvValue('VITE_BE_HOST', host, mode);
  }

  Object.assign(process.env, env);

  return {
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@config': path.resolve(__dirname, './src/config'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@router': path.resolve(__dirname, './src/router'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@components': path.resolve(__dirname, './src/components'),
      },
    },
    plugins: [react()],
    server: {
      host: true,
      port: Number(env.VITE_FE_PORT || 5709),
    },
    preview: {
      port: 5173,
    },
  };
});

export const getIPv4Address = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceKey in interfaces) {
    const addressList = interfaces[interfaceKey];
    if (addressList) {
      for (let i = 0; i < addressList.length; i++) {
        const address = addressList[i];
        if (address.family === 'IPv4' && !address.internal) {
          return address.address;
        }
      }
    }
  }

  return 'localhost';
};

const getEnvPath = (mode: string) => path.resolve(__dirname, `.env.${mode}`);

const readEnvVars = (p: string) => fs.readFileSync(p, 'utf-8').split(os.EOL);

const setEnvValue = (key: string, value: string, mode: string) => {
  const envFilePath = getEnvPath(mode);
  try {
    const envVars = readEnvVars(envFilePath);
    const targetLine = envVars.find((line) => line.split('=')[0] === key);
    if (targetLine !== undefined) {
      const targetLineIndex = envVars.indexOf(targetLine);
      envVars.splice(targetLineIndex, 1, `${key}=${value}`);
    } else {
      envVars.push(`${key}=${value}`);
    }
    fs.writeFileSync(envFilePath, envVars.join(os.EOL));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`ERROR: Env update failed. Please create this file \n${envFilePath}`);
    }
  }
};
