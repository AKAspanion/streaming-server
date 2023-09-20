/* eslint-disable @typescript-eslint/no-explicit-any */

import { getNetworkAPIUrl } from './api';
import { sleep } from '@common/utils/func';

export const setup = (loadApp: () => void) => {
  let backendReady = false;
  let hostReceived = false;
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
          if (!window.networkHost) {
            window.networkHost = arg.host;
          }
          hostReceived = true;
        });
      } else {
        hostReceived = true;
      }
    } catch (error) {
      hostReceived = true;
    }

    const waitForBE = async () => {
      backendReady = await checkBEState();

      if (hostReceived && backendReady) {
        loadApp();
      } else {
        await sleep(500);
        waitForBE();
      }
    };

    waitForBE();
  } catch (error) {
    loadApp();
  }
};

const checkBEState = async () => {
  const baseUrl = getNetworkAPIUrl();

  try {
    const response = await fetch(baseUrl + '/server/ready');
    const data = await response.json();
    if (data?.ip && !data?.ip?.includes('local')) {
      window.networkHost = `http://${data.ip}`;
    }

    try {
      const authRes = await fetch(baseUrl + '/auth/token/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const authData = await authRes.json();
      if (authData?.data?.token) {
        window.token = authData?.data?.token;
      }
    } catch (error) {
      // err
    }
    return true;
  } catch (error) {
    return false;
  }
};
