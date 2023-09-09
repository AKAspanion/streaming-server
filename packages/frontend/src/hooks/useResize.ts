import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

type SizeState = {
  width: number;
  height: number;
};

const useResize = <T extends HTMLElement = HTMLDivElement>(
  callback?: (entries: ResizeObserverEntry[], size: SizeState) => void,
  elementRef?: RefObject<T>,
): SizeState => {
  const [size, setSize] = useState<SizeState>({
    width: document?.body?.clientWidth,
    height: document?.body?.clientWidth,
  });

  const observer = useRef(
    new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect || {};

      setSize({ width, height });

      callback && callback(entries, { width, height });
    }),
  );

  useEffect(() => {
    const currentObserver = observer?.current;
    const node = elementRef?.current;
    if (node) {
      currentObserver?.observe(node);
    } else {
      currentObserver?.observe(document.body);
    }

    return () => {
      if (node) {
        currentObserver && currentObserver?.unobserve(node as Element);
      } else {
        currentObserver && currentObserver?.unobserve(document.body);
      }
    };
  }, [elementRef, observer]);

  return size;
};

export default useResize;
