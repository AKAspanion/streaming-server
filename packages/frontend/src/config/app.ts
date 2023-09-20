const port: string = import.meta.env.VITE_FE_PORT;

const networkFEUrl = () =>
  `${window.networkHost || import.meta.env.VITE_BE_HOST || window.location.origin || '/'}${
    port ? ':' + port : ''
  }`;

export const getNetworkFEUrl = (endpoint?: string) => `${networkFEUrl()}/#${endpoint || ''}`;

export const IS_DEV = process.env.NODE_ENV === 'development';
