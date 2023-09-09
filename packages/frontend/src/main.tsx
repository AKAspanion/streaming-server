/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ipcRenderer = require('electron').ipcRenderer;
  if (ipcRenderer) {
    ipcRenderer.send('network_host');
    ipcRenderer.on('network_host', (_: any, arg: any) => {
      ipcRenderer.removeAllListeners('network_host');
      window.networkHost = arg.host;
    });
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (_: any, arg: any) => {
      ipcRenderer.removeAllListeners('app_version');
      window.appVersion = arg.version;
    });
  }
} catch (error) {
  // no ipc renderer
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
