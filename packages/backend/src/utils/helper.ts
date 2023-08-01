import fs from 'fs';
import path from 'path';
import { mkdirp } from 'mkdirp';

export const getResourcePath = (folderPath: string, fallback = process.cwd()) => {
  const electronRoot = process.env.RESOURCE_PATH_IN_ELECTRON;

  if (electronRoot) {
    return path.join(electronRoot, folderPath);
  }

  return path.join(fallback, folderPath);
};

export const makeDirectory = (folderPath: string) => {
  mkdirp.sync(folderPath);
};

export const deleteDirectory = (directoryPath: string) => {
  try {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file) => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteDirectory(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(directoryPath);
    }
  } catch (error) {
    // err
    console.error('Directory not found', directoryPath);
  }
};

export const deleteFile = (filePath: string) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    // err
  }
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
