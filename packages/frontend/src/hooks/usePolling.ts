/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';

type UsePollingEffect = (
  callback: any,
  deps?: any[],
  options?: { interval?: number; onCleanUp: () => void },
) => void;

const usePollingEffect: UsePollingEffect = (asyncCallback, dependencies = [], options) => {
  const { interval = 10_000, onCleanUp } = options || {};
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    let _stopped = false;

    // Side note: preceding semicolon needed for IIFEs.
    (async function pollingCallback() {
      try {
        await asyncCallback();
      } finally {
        // Set timeout after it finished, unless stopped
        timeoutIdRef.current = !_stopped && setTimeout(pollingCallback, interval);
      }
    })();
    // Clean up if dependencies change
    return () => {
      _stopped = true; // prevent racing conditions
      clearTimeout(timeoutIdRef.current);
      onCleanUp && onCleanUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, interval]);
};

export default usePollingEffect;
