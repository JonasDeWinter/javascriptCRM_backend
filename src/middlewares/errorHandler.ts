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

function isMissingAssociatedCompany(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503" &&
    "constraint" in error &&
    error.constraint === "contacts_company_id_fkey"
  );
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isMissingAssociatedCompany(error)) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

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
