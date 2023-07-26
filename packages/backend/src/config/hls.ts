/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hls = require('hls-server');
import fs from 'fs';

export const hlsInit = (server: any) => {
  new hls(server, {
    provider: {
      exists: (req: Request, cb: any) => {
        const ext = req.url.split('.').pop();
        console.log('here');

        if (ext !== 'm3u8' && ext !== 'ts') {
          return cb(null, true);
        }

        fs.access(__dirname + req.url, fs.constants.F_OK, function (err) {
          if (err) {
            console.log('File not exist');
            return cb(null, false);
          }
          cb(null, true);
        });
      },
      getManifestStream: (req: Request, cb: any) => {
        const stream = fs.createReadStream(__dirname + req.url);
        cb(null, stream);
      },
      getSegmentStream: (req: Request, cb: any) => {
        const stream = fs.createReadStream(__dirname + req.url);
        cb(null, stream);
      },
    },
  });
};
