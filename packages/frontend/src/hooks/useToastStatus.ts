import { QueryStatus } from '@reduxjs/toolkit/dist/query';
import { useEffect } from 'react';
import toast from 'react-hot-toast/headless';

type UseToastStatusOptions = {
  successMessage?: string;
  errorMessage?: string;
};

type UseToastStatus = (
  status: QueryStatus,
  options: UseToastStatusOptions,
  callback?: (status: QueryStatus) => void,
) => void;

const useToastStatus: UseToastStatus = (status, options, callback) => {
  const { successMessage, errorMessage } = options;

  useEffect(() => {
    if (status === 'rejected') {
      if (errorMessage) toast.error(errorMessage);

      callback && callback(status);
    } else if (status === 'fulfilled') {
      if (successMessage) toast.success(successMessage);

      callback && callback(status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
};

export default useToastStatus;
