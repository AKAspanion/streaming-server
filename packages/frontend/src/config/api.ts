const host: string = import.meta.env.VITE_BE_HOST || window.location.origin;
const port: string = import.meta.env.VITE_BE_PORT;

export const getNetworkAPIUrl = () => `${host}${port ? ':' + port : ''}`;
