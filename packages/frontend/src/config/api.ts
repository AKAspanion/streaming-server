const host = import.meta.env.VITE_BE_HOST;
const port = import.meta.env.VITE_BE_PORT;

export const baseUrl = `${host}${port ? ":" + port : ""}`;
