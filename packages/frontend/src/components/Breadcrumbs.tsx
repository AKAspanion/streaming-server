import cs from 'classnames';
import React, { useEffect } from 'react';
import { useMemo } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

function Breadcrumbs() {
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

  const crumbsLength = crumbs.length;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--breadcrumbs-height',
      crumbsLength ? '48px' : '0px',
    );
  }, [crumbsLength]);

  return crumbsLength === 0 ? null : (
    <div
      className={cs(
        'flex items-center gap-3 p-3 border-b dark:border-slate-700 border-slate-300',
        'h-[var(--breadcrumbs-height)]',
      )}
    >
      {/* <IconButton onClick={goBack}>
        <div className="w-4">
          <ArrowLeftIcon />
        </div>
      </IconButton> */}
      <ol className="items-center text-sm flex gap-2">
        {/* <Link to="/">
          <div className="w-4">
            <HomeIcon />
          </div>
        </Link> */}
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
