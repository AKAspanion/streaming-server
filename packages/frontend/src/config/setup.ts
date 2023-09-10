/* eslint-disable @typescript-eslint/no-explicit-any */
export const setup = (callback: () => void) => {
  try {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ipcRenderer = require('electron').ipcRenderer;
      if (ipcRenderer) {
        ipcRenderer.send('app_version');
        ipcRenderer.on('app_version', (_: any, arg: any) => {
          ipcRenderer.removeAllListeners('app_version');
          window.appVersion = arg.version;
        });

        ipcRenderer.send('network_host');
        ipcRenderer.on('network_host', (_: any, arg: any) => {
          ipcRenderer.removeAllListeners('network_host');
          window.networkHost = arg.host;
          callback();
        });
      } else {
        callback();
      }
    } catch (error) {
      // console.log('IPC renderer load failed');
      callback();
    }
  } catch (error) {
    callback();
  }
};
