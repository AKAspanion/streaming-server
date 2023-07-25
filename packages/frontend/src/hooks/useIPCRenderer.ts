import { useEffect, useRef } from 'react';

const useIPCRenderer = () => {
  const renderRef = useRef<any>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ipcRenderer = require('electron').ipcRenderer;
      renderRef.current = ipcRenderer;
    } catch (error) {
      console.log('IPC renderer load failed');
    }
  }, []);

  return renderRef.current;
};

export default useIPCRenderer;
