import { AppError, HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import uniqBy from 'lodash.uniqby';
import { getFileType, listDrives } from '@utils/file';
import { ALLOWED_VIDEO_FILES } from '@common/constants/app';
import logger from '@utils/logger';
// eslint-disable-next-line @typescript-eslint/no-var-requires

export const getFilesInPath: RequestHandler = async (req, res) => {
  const { dir: dirInReq } = req.body;
  const dir = String(dirInReq || '');
  // if (dir && dir.endsWith(`\\`)) {
  //   dir = dir.slice(0, dir.length - 1);
  // }

  let drives: FileLocationType[] = [];

  try {
    drives = await listDrives();

    const homeDir = os.homedir();
    drives.unshift({
      path: homeDir,
      name: homeDir,
      type: 'directory',
    });

    drives = uniqBy(drives, 'path');
  } catch (error) {
    throw new AppError({
      description: 'Directory not found',
      httpCode: HttpCode.BAD_REQUEST,
    });
  }

  if (!dir) {
    console.log('A:', 'B:', 'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:');
    console.log('N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'W:', 'Z:');
    return res.status(HttpCode.OK).send({ data: drives });
  } else {
    try {
      let files: FileLocationType[] = [];

      fs.readdirSync(path.resolve(dir)).forEach((filename) => {
        const isSystem =
          filename.includes('System Volume Information') ||
          filename.includes('$RECYCLE.BIN') ||
          filename.includes('.log') ||
          filename.includes('.sys');
        const isHidden = filename.startsWith('.');

        const canShow = !isSystem && !isHidden;
        if (canShow) {
          try {
            const ext = path.parse(filename).ext;
            const name = path.parse(filename).name;
            const filepath = path.join(dir, filename);
            const { type, isFile } = getFileType(filepath);

            if (isFile && ALLOWED_VIDEO_FILES.includes(ext)) {
              files.push({ path: filepath, name, ext, type, isFile });
            } else if (!isFile) {
              files.push({ path: filepath, name, ext, type, isFile });
            }
          } catch (error) {
            logger.error('STAT' + error);
          }
        }
      });

      files.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      files.sort((a, b) => {
        return a.type.localeCompare(b.type, undefined, { numeric: false, sensitivity: 'base' });
      });

      const isRootDrive = drives.findIndex((d) => path.resolve(d.path) === path.resolve(dir));
      const prevDir = isRootDrive !== -1 ? '' : path.resolve(dir, '..');

      files = [
        { name: '...', path: prevDir, type: 'directory', isFile: false },
        ...uniqBy(files, 'path'),
      ];
      return res.status(HttpCode.OK).send({ data: files });
    } catch (error) {
      logger.error('READ' + error);
      throw new AppError({
        description: 'Failed to load directory',
        httpCode: HttpCode.BAD_REQUEST,
      });
    }
  }
};
