// import path from "path";
import fs from 'fs';

export const readFile = () => {
  //   const filepath = path.resolve(dir, filename);
  //   const name = path.parse(filename).name;
  //   const ext = path.parse(filename).ext;
  //   const stat = fs.statSync(filepath);
  //   const isFile = stat.isFile();
};

export const getFileType = (filepath: string) => {
  const stat = fs.statSync(filepath);
  const isFile = stat.isFile();

  return { type: isFile ? 'file' : ('directory' as PathLocationType), isFile };
};

export const checkIfFileExists = (filePath: string) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export const waitForFileAccess = (
  options: { filePath: string; interval?: number; retries?: number },
  onSuccess?: () => void,
  onFailure?: () => void,
) => {
  const { filePath, interval = 1000, retries = 20 } = options;
  let timer = 0;
  const loop = setInterval(() => {
    timer++;
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        clearInterval(loop);
        onSuccess && onSuccess();
      }

      if (timer >= retries) {
        onFailure && onFailure();
      }
    });
  }, interval);
};
