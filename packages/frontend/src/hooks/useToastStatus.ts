import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useEffect } from "react";
import toast from "react-hot-toast/headless";

type UseToastStatusOptions = {
  successMessage?: string;
  errorMessage?: string;
};

type UseToastStatus = (
  status: QueryStatus,
  options: UseToastStatusOptions
) => void;

const useToastStatus: UseToastStatus = (status, options) => {
  const { successMessage, errorMessage } = options;

  useEffect(() => {
    if (status === "rejected") {
      if (errorMessage) toast.error(errorMessage);
    } else if (status === "fulfilled") {
      if (successMessage) toast.success(successMessage);
    }
  }, [status]);
};

export default useToastStatus;
