import type { Response } from "express";
import type {
  Company,
  CreateCompanyInput
} from "../models/company";
import {
  createCompany as createCompanyRecord,
  deleteCompany as deleteCompanyRecord,
  getCompanies,
  getCompanyById,
  updateCompany as updateCompanyRecord,
} from "../services/companyService";
import type { ApiResponse } from "../utils/apiResponse";
import { apiError, apiSuccess } from "../utils/apiResponse";
import type { TypedRequestBody } from "../utils/TypedRequestBody";

type CompanyDeleteResult = { id: string; deleted: true };

export function listCompanies(
  _req: TypedRequestBody<unknown>,
  res: Response<ApiResponse<Company[]>>,
): void {
  res.json(apiSuccess(getCompanies()));
}

export function getCompany(
  req: TypedRequestBody<Company>,
  res: Response<ApiResponse<Company>>,
): void {
  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Company ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Company ID is required"));
    return;
  }

  const id = req.params.id;

  const company = getCompanyById(id);
  if (!company) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

  res.json(apiSuccess(company));
}

export function createCompany(
  req: TypedRequestBody<CreateCompanyInput>,
  res: Response<ApiResponse<Company>>,
): void {
  res.status(201).json(apiSuccess(createCompanyRecord(req.body)));
}

export function updateCompany(
  req: TypedRequestBody<Company>,
  res: Response<ApiResponse<Company>>,
): void {
  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Company ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Company ID is required"));
    return;
  }

  const id = req.params.id;
  const company = updateCompanyRecord(id, req.body);
  if (!company) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

  res.json(apiSuccess(company));
}

export function deleteCompany(
  req: TypedRequestBody<Company>,
  res: Response<ApiResponse<CompanyDeleteResult>>,
): void {
  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Company ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Company ID is required"));
    return;
  }

  const id = req.params.id;

  if (!deleteCompanyRecord(id)) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

  res.json(apiSuccess({ id, deleted: true }));
}
