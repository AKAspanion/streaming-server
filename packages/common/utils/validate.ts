export const normalizeText = (value?: string | number | object | null, fallback = ''): string =>
  value === '' || value === undefined || value === null || typeof value === 'object'
    ? fallback
    : String(value);
