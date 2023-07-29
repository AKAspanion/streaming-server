export const IS_DEV = process.env.NODE_ENV === 'development';

import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { deleteDirectory, getResourcePath, makeDirectory } from '@utils/helper';

export const appInit = () => {
  const tempDir = getResourcePath(SEGMENT_TEMP_FOLDER);
  deleteDirectory(tempDir);

  makeDirectory(getResourcePath('_appdata/_db'));
  makeDirectory(getResourcePath('_appdata/_temp'));
  makeDirectory(getResourcePath('_appdata/_subs'));
  makeDirectory(getResourcePath('_appdata/_videos'));
  makeDirectory(getResourcePath('_appdata/_screenshots'));
};
