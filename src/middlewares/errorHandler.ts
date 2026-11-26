import type { ErrorRequestHandler } from "express";
import { apiError } from "../utils/apiResponse";

function getStatusCode(error: unknown): number {
  if (typeof error !== "object" || error === null) {
    return 500;
  }

  const status =
    "status" in error
      ? error.status
      : "statusCode" in error
        ? error.statusCode
        : undefined;

  if (
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 400 &&
    status <= 599
  ) {
    return status;
  }

  return 500;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = getStatusCode(error);
  console.error(error);

  const message =
    statusCode >= 500
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : "Request failed";

  res.status(statusCode).json(apiError(statusCode, message));
};

export default errorHandler;
