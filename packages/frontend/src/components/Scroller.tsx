import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import cs from 'classnames';
import useEventListener from '../hooks/useEventListener';
import useResize from '@/hooks/useResize';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid';

export declare type ScrollerProps = {
  children: React.ReactNode;
  width: string;
  wrap?: boolean;
  top?: boolean;
  padded?: boolean;
  className?: string;
};

const Scroller: React.FC<ScrollerProps> = ({
  children,
  width,
  top = false,
  wrap = false,
  padded = true,
  className,
}) => {
  const divRef = useRef<HTMLInputElement>(null);
  const [showLeftScroller, setShowLeftScroller] = useState(false);
  const [showRightScroller, setShowRightScroller] = useState(false);

  const handleScroll = useCallback(
    (flag: number) => () => {
      if (divRef?.current) {
        const ulDom = divRef.current;
        const offset = (ulDom.scrollWidth || 1000) / 10;

        ulDom.scrollLeft = ulDom.scrollLeft + offset * flag;
      }
    },
    [],
  );

  const truncate = useCallback((value: number) => {
    if (value < 0) {
      return Math.floor(value);
    }
    return Math.ceil(value);
  }, []);

  const handleULUpdate = useCallback(() => {
    if (divRef?.current) {
      const divDom = divRef.current;
      const scrollLeft = Math.abs(truncate(divDom.scrollLeft));
      const scrollWidth = truncate(divDom.scrollWidth);
      const clientWidth = truncate(divDom.clientWidth);

      if (clientWidth < scrollWidth) {
        if (scrollLeft < scrollWidth - clientWidth) {
          setShowRightScroller(true);
        } else {
          setShowRightScroller(false);
        }

        if (Math.abs(divDom.scrollLeft) > 0) {
          setShowLeftScroller(true);
        } else {
          setShowLeftScroller(false);
        }
      } else {
        setShowRightScroller(false);
        setShowLeftScroller(false);
      }
    }
  }, []);

  useLayoutEffect(() => {
    handleULUpdate();
  }, []);

  useEventListener('scroll', handleULUpdate, divRef);
  useResize(handleULUpdate, divRef);

  if (!children) {
    console.warn('Scroller component requires children');
    return null;
  }

  return (
    <React.Fragment>
      <div
        className={cs('flex gap-4 justify-between relative', className)}
        style={{ width: width }}
      >
        <div
          ref={divRef}
          className={cs(
            'scroller-children flex items-start gap-4 overflow-x-auto overflow-y-hidden scroll-smooth',
            { 'px-4': padded, wrap: wrap },
          )}
          style={{ width: width, 'scrollbar-height': 'none' } as React.CSSProperties}
        >
          {children}
        </div>
        {showRightScroller && !wrap ? (
          <div
            className={cs(
              'z-20 right-0 absolute inline-flex cursor-pointer items-center justify-center',
              {
                'h-14 w-14 shadow-lg  bg-slate-50 dark:bg-slate-950 rounded-full': top,
                'h-full bg-gradient-to-r from-transparent to-slate-50 dark:to-slate-950': !top,
              },
            )}
            onClick={handleScroll(1)}
          >
            <div className={cs(top ? 'w-6' : 'w-8')}>
              <ChevronDoubleRightIcon />
            </div>
          </div>
        ) : null}
        {showLeftScroller && !wrap ? (
          <div
            className={cs(
              'z-20 left-0 absolute inline-flex cursor-pointer items-center justify-center',
              {
                'h-14 w-14 shadow-lg bg-slate-50 dark:bg-slate-950 rounded-full': top,
                'h-full bg-gradient-to-l from-transparent to-slate-50 dark:to-slate-950': !top,
              },
            )}
            onClick={handleScroll(-1)}
          >
            <div className={cs(top ? 'w-6' : 'w-8')}>
              <ChevronDoubleLeftIcon />
            </div>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
};

export default Scroller;
