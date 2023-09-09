import { HttpCode } from '@utils/exceptions';
import logger from '@utils/logger';
import { RequestHandler } from 'express';
import os from 'os';

export const quitServer: RequestHandler = async (_, res) => {
  logger.info('Received kill signal, shutting down gracefully');

  setTimeout(() => {
    logger.info('Closing');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  return res.status(HttpCode.OK).send({ message: 'Server exit started' });
};

const getIPv4Address = () => {
  const interfaces = os.networkInterfaces();
  const allAddress = [{ type: 'Local', address: 'localhost' }];
  for (const interfaceKey in interfaces) {
    const addressList = interfaces[interfaceKey];
    addressList?.forEach((address) => {
      if (address.family === 'IPv4' && !address.internal) {
        allAddress.push({ type: 'Network', address: `${address.address}` });
      }
    });
  }
  return allAddress;
};

const getNetworkIP = () => {
  return (
    getIPv4Address().find((n) => n.type === 'Network') || { type: 'Local', address: 'localhost' }
  ).address;
};

export const networkIp: RequestHandler = async (_, res) => {
  return res.status(HttpCode.OK).send({ ip: getNetworkIP() || 'localhost' });
};
