declare global {
  interface Window {
    appVersion?: string;
    networkHost?: string;
    token?: string;
    require?: NodeJS.Require;
  }
}

export {};
