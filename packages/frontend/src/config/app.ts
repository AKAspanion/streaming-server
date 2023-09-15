const port: string = import.meta.env.VITE_FE_PORT;

export const getNetworkFEUrl = () =>
  `${import.meta.env.VITE_BE_HOST || window.networkHost || window.location.origin || '/'}${
    port ? ':' + port : ''
  }`;

export const IS_DEV = process.env.NODE_ENV === 'development';
