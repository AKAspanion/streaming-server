const host: string = import.meta.env.VITE_BE_HOST;
const port: string = import.meta.env.VITE_BE_PORT;

export const baseUrl = `${host}${port ? ':' + port : ''}`;
