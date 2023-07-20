/* eslint-disable @typescript-eslint/no-explicit-any */
export const info = (message?: any, ...optionalParams: any[]): void => {
  if (typeof message === 'string') {
    console.log(`[${getDate()}] [INFO] ${message}`, ...optionalParams);
  } else {
    console.log(`[${getDate()}] [INFO]`, message, ...optionalParams);
  }
};

export const error = (message?: any, ...optionalParams: any[]): void => {
  if (typeof message === 'string') {
    console.error(`[${getDate()}] [ERROR] ${message}`, ...optionalParams);
  } else {
    console.error(`[${getDate()}] [ERROR]`, message, ...optionalParams);
  }
};

export const warn = (message?: any, ...optionalParams: any[]): void => {
  if (typeof message === 'string') {
    console.warn(`[${getDate()}] [WARN] ${message}`, ...optionalParams);
  } else {
    console.warn(`[${getDate()}] [WARN]`, message, ...optionalParams);
  }
};

const getDate = () => new Date().toISOString();

export default { info, error, warn };
