const host: string = window.networkHost || import.meta.env.VITE_BE_HOST;
const port: string = import.meta.env.VITE_FE_PORT;

export const getNetworkFEUrl = () => `${window.networkHost || host}${port ? ':' + port : ''}`;

export const IS_DEV = process.env.NODE_ENV === 'development';
