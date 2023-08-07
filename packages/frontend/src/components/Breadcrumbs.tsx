import cs from 'classnames';
import React, { useEffect } from 'react';
import { useMemo } from 'react';
import { Link, useMatches, useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import IconButton from './atoms/icon-button/IconButton';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/solid';
import { setSidebarOpen } from '@/store/globalSlice';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import useIPCRenderer from '@/hooks/useIPCRenderer';

function Breadcrumbs() {
  const ipcRenderer = useIPCRenderer();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s?.globalData?.sidebarOpen);
  const navigate = useNavigate();
  const matches = useMatches();

  const crumbs = useMemo(() => {
    const crumbList: CrumbType[] = [];
    matches
      .filter((match) => Boolean((match.handle as RouterHandler)?.crumb))
      .forEach((match) => {
        (match.handle as RouterHandler).crumb.forEach((c) => {
          const res = c(match.data);
          crumbList.push(res);
        });
      });

    return crumbList;
  }, [matches]);

  const goBack = () => {
    navigate(-1);
  };

  const crumbsLength = crumbs.length;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--breadcrumbs-height',
      crumbsLength ? 'var(--breadcrumbs-height-value)' : '0px',
    );
  }, [crumbsLength]);

  return crumbsLength === 0 ? null : (
    <div
      className={cs(
        'flex items-center gap-4 px-4 border-b dark:border-slate-700 border-slate-300',
        'h-[var(--breadcrumbs-height)]',
      )}
    >
      {ipcRenderer && (
        <div className="w-6 cursor-pointer" onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}>
          <Bars3BottomLeftIcon />
        </div>
      )}
      <IconButton onClick={goBack}>
        <div className="w-4">
          <ArrowLeftIcon />
        </div>
      </IconButton>
      <ol className="items-center text-sm gap-2 hidden sm:flex">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbsLength - 1;
          return (
            <React.Fragment key={crumb.label}>
              <Link to={crumb.to} className={cs({ '': isLast })}>
                <p
                  className={cs({
                    'text-slate-500 dark:hover:text-slate-100 hover:text-slate-950': !isLast,
                  })}
                >
                  {crumb.label}
                </p>
              </Link>
              <p className="text-slate-500 w-4">{isLast ? '' : <ChevronRightIcon />}</p>
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
}

export default Breadcrumbs;
