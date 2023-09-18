const port: string = import.meta.env.VITE_BE_PORT;

export const getNetworkAPIUrl = () =>
  `${import.meta.env.VITE_BE_HOST || window.networkHost || window.location.origin || '/'}${
    port ? ':' + port : ''
  }`;

export const getNetworkAPIUrlWithAuth = (endpoint?: string) =>
  `${getNetworkAPIUrl()}${endpoint || ''}${endpoint?.includes('?') ? '&token' : '?token'}=${
    window.token
  }`;
