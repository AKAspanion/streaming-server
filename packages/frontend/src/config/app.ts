const port: string = import.meta.env.VITE_FE_PORT;

const networkFEUrl = () =>
  `${import.meta.env.VITE_BE_HOST || window.networkHost || window.location.origin || '/'}${
    port ? ':' + port : ''
  }`;

export const getNetworkFEUrl = (path?: string) => networkFEUrl() + '/#' + path || '';

export const IS_DEV = process.env.NODE_ENV === 'development';
