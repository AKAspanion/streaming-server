/* eslint-disable @typescript-eslint/no-explicit-any */
import { RefObject, useEffect, useRef } from 'react';

export declare type UseEventListenerEvent = any;

const useEventListener = <T extends HTMLElement = HTMLDivElement>(
  eventName: keyof WindowEventMap,
  handler: (event: UseEventListenerEvent) => void,
  element?: RefObject<T>,
  options?: boolean | EventListenerOptions,
) => {
  const savedHandler = useRef<(event: UseEventListenerEvent) => void>();

  useEffect(() => {
    const targetElement: T | Window = element?.current || window;

    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    if (savedHandler.current !== handler) {
      savedHandler.current = handler;
    }

    const eventListener = (event: UseEventListenerEvent) => {
      if (savedHandler?.current) {
        savedHandler.current(event);
      }
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options, handler]);
};

export default useEventListener;
