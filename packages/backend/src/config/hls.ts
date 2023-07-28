import { SEGMENT_TEMP_FOLDER } from '@constants/hls';
import { deleteDirectory, getResourcePath } from '@utils/helper';

export const hlsInit = () => {
  const tempDir = getResourcePath(SEGMENT_TEMP_FOLDER);
  deleteDirectory(tempDir);
};
