const host: string = import.meta.env.VITE_BE_HOST || window.location.origin;
const port: string = import.meta.env.VITE_FE_PORT;

export const getNetworkFEUrl = () => `${host}${port ? ':' + port : ''}`;

export const IS_DEV = process.env.NODE_ENV === 'development';
