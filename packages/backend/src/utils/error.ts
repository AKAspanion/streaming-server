import { AppError, HttpCode } from "./exceptions";

export const handleJSONDBDataError = (error: any, id: string) => {
  if (error.name === "DataError") {
    throw new AppError({
      httpCode: HttpCode.BAD_REQUEST,
      description: `Can't find video with ID '${id}'`,
    });
  } else {
    throw new AppError({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      description: error.message,
    });
  }
};
