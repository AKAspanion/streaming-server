import { AppError, HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';
import { Drive } from 'drivelist';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { getFileType } from '@utils/file';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const drivelist = require('drivelist');

export const getFilesInPath: RequestHandler = async (req, res) => {
  const { dir } = req.body;

  if (!dir) {
    try {
      const drives: FileLocationType[] = [];
      const systemDrives: Drive[] = await drivelist.list();

      (systemDrives || []).forEach((d) => {
        (d?.mountpoints || []).forEach((m) => {
          drives.push({
            path: m?.path,
            name: m?.path,
            type: 'directory',
          });
        });
      });

      const homeDir = os.homedir();
      drives.push({
        path: homeDir,
        name: homeDir,
        type: 'directory',
      });
      return res.status(HttpCode.OK).send({ data: drives });
    } catch (error) {
      throw new AppError({
        description: 'Directory not found',
        httpCode: HttpCode.BAD_REQUEST,
      });
    }
  } else {
    try {
      const files: FileLocationType[] = [];

      fs.readdirSync(dir).forEach((filename) => {
        const isSystem = filename.includes('System Volume Information');
        const isHidden = filename.startsWith('.');

        const canShow = !isSystem && !isHidden;
        if (canShow) {
          const name = path.parse(filename).name;
          const ext = path.parse(filename).ext;
          const filepath = path.resolve(dir, filename);

          files.push({ path: filepath, name, ext, type: getFileType(filepath) });
        }
      });

      files.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      files.sort((a, b) => {
        return a.type.localeCompare(b.type, undefined, { numeric: false, sensitivity: 'base' });
      });

      return res.status(HttpCode.OK).send({ data: files });
    } catch (error) {
      throw new AppError({
        description: 'Directory not found',
        httpCode: HttpCode.BAD_REQUEST,
      });
    }
  }
};
