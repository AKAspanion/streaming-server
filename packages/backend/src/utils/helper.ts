import fs from 'fs';
import path from 'path';

export const getResourcePath = (folderPath: string, fallback = process.cwd()) => {
  const electronRoot = process.env.RESOURCE_PATH_IN_ELECTRON;

  if (electronRoot) {
    return path.join(electronRoot, folderPath);
  }

  return path.join(fallback, folderPath);
};

export const makeDirectory = (folderPath: string) => {
  fs.mkdirSync(folderPath, { recursive: true });
};
