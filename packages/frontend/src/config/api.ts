const host: string = window.networkHost || import.meta.env.VITE_BE_HOST;
const port: string = import.meta.env.VITE_BE_PORT;

export const getNetworkAPIUrl = () => `${window.networkHost || host}${port ? ':' + port : ''}`;
