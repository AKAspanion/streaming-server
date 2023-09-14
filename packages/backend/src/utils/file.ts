// import path from "path";
import fs from 'fs';
import cp from 'child_process';

export const getFileType = (filepath: string) => {
  const stat = fs.statSync(filepath);
  const isFile = stat.isFile();

  return { type: isFile ? 'file' : ('directory' as PathLocationType), isFile, stat };
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

export const getWinDrives = () =>
  new Promise<FileLocationType[]>((resolve, reject) => {
    let stdout = '';
    const spawn = cp.spawn;
    const list = spawn('cmd');

    list.stdout.on('data', function (data) {
      stdout += data;
    });

    list.stderr.on('data', function (data) {
      reject(data);
    });

    list.on('exit', function (code) {
      if (code == 0) {
        let data = stdout.split('\r\n');
        data = data.splice(4, data.length - 7);
        data = data.map(Function.prototype.call, String.prototype.trim);
        data = data.map((d) => d + '\\');
        resolve(data.map((p) => ({ path: p, name: p, type: 'directory', isFile: false })));
      } else {
        reject(new Error("Coudn't find drives"));
      }
    });

    list.stdin.write('wmic logicaldisk get caption\n');
    list.stdin.end();
  });

export const listDrives = () => {
  if (process.platform !== 'darwin') {
    return getWinDrives();
  } else {
    return new Promise<FileLocationType[]>((resolve) => resolve([]));
  }
};
