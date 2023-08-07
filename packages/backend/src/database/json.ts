import { IS_DEV } from '@config/app';
import { getResourcePath } from '@utils/helper';
import { JsonDB, Config } from 'node-json-db';

const videoDBPath = getResourcePath('/_appdata/_db/StreamingServerVideoDB');
const mediaDBPath = getResourcePath('/_appdata/_db/StreamingServerMediaDB');
const folderDBPath = getResourcePath('/_appdata/_db/StreamingServerFolderDB');

export const vidoesDB = new JsonDB(new Config(videoDBPath, true, IS_DEV, '/'));
export const mediaDB = new JsonDB(new Config(mediaDBPath, true, IS_DEV, '/'));
export const folderDB = new JsonDB(new Config(folderDBPath, true, IS_DEV, '/'));

export const getVideoDataDB = async <T>(path: string) => {
  try {
    const data: T = await vidoesDB.getData(path);

    return { error: undefined, data };
  } catch (error) {
    return { error, data: undefined };
  }
};

export const pushVideoDB = async <T>(path: string, body: T) => {
  try {
    await vidoesDB.push(path, body);

    return { error: undefined };
  } catch (error) {
    return { error };
  }
};

export const deleteVideoDB = async (path: string) => {
  try {
    await vidoesDB.delete(path);

    return { error: undefined };
  } catch (error) {
    return { error };
  }
};

export const pushMediaDB = async <T>(path: string, body: T) => {
  try {
    await mediaDB.push(path, body);

    return { error: undefined };
  } catch (error) {
    return { error };
  }
};

export const getMediaDataDB = async <T>(path: string) => {
  try {
    const data: T = await mediaDB.getData(path);

    return { error: undefined, data };
  } catch (error) {
    return { error, data: undefined };
  }
};

export const deleteMediaDB = async (path: string) => {
  try {
    await mediaDB.delete(path);

    return { error: undefined };
  } catch (error) {
    return { error };
  }
};

export const geMediaDBIndex = async (path: string, id: string) => {
  try {
    const index = await mediaDB.getIndex(path, id, 'id');

    return { index, error: undefined };
  } catch (error) {
    return { error, index: undefined };
  }
};

export const pushFolderDB = async <T>(path: string, body: T) => {
  try {
    await folderDB.push(path, body);

    return { error: undefined };
  } catch (error) {
    return { error };
  }
};

export const getFolderDataDB = async <T>(path: string) => {
  try {
    const data: T = await folderDB.getData(path);

    return { error: undefined, data };
  } catch (error) {
    return { error, data: undefined };
  }
};

export const deleteFolderDB = async (path: string) => {
  try {
    await folderDB.delete(path);

    return { error: undefined };
  } catch (error) {
    return { error };
  }
};
