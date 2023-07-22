import { IS_DEV } from '@config/app';
import { getResourcePath } from '@utils/helper';
import { JsonDB, Config } from 'node-json-db';

const videoDBPath = getResourcePath('/_db/StreamingServerVideoDB');

export const vidoesDB = new JsonDB(new Config(videoDBPath, true, IS_DEV, '/'));

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
