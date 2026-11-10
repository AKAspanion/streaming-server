import { useEffect, useRef, useState } from 'react';

const useIPCRenderer = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRef = useRef<any>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      const ipcRenderer = window.require('electron').ipcRenderer;
      renderRef.current = ipcRenderer;
      setTick((i) => i + 1);
    } catch (error) {
      // console.log('IPC renderer load failed');
    }
  }, []);

  return renderRef.current;
};

export default useIPCRenderer;
