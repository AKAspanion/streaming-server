export const IS_DEV = process.env.NODE_ENV === 'development';

import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { deleteDirectory, getResourcePath, makeDirectory } from '@utils/helper';

export const appInit = () => {
  const tempDir = getResourcePath(SEGMENT_TEMP_FOLDER + '../');
  deleteDirectory(tempDir);

  makeDirectory(getResourcePath('_app_data/_db'));
  makeDirectory(getResourcePath('_app_data/_temp'));
  makeDirectory(getResourcePath('_app_data/_subs'));
  makeDirectory(getResourcePath('_app_data/_videos'));
  makeDirectory(getResourcePath('_app_data/_images'));
};
