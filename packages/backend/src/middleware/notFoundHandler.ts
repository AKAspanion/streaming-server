import { AppError, HttpCode } from "@utils/exceptions";
import { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = () => {
  throw new AppError({
    httpCode: HttpCode.NOT_FOUND,
    description: "Route not found",
  });
};
