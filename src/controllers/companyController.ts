import type { Response } from "express";
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
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
): Promise<void> {
  return getCompanies().then((companies) => {
    res.json(apiSuccess(companies));
  });
}

export async function getCompany(
  req: TypedRequestBody<Company>,
  res: Response<ApiResponse<Company>>,
): Promise<void> {
  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Company ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Company ID is required"));
    return;
  }

  const id = req.params.id;

  const company = await getCompanyById(id);
  if (!company) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

  res.json(apiSuccess(company));
}

export async function createCompany(
  req: TypedRequestBody<CreateCompanyInput>,
  res: Response<ApiResponse<Company>>,
): Promise<void> {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    typeof req.body.name !== "string" ||
    !req.body.name.trim()
  ) {
    res.status(400).json(apiError(400, "Company name is required"));
    return;
  }

  const company = await createCompanyRecord(req.body);
  res.status(201).json(apiSuccess(company));
}

export async function updateCompany(
  req: TypedRequestBody<UpdateCompanyInput>,
  res: Response<ApiResponse<Company>>,
): Promise<void> {
  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Company ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Company ID is required"));
    return;
  }

  const id = req.params.id;
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    res.status(400).json(apiError(400, "A JSON object is required"));
    return;
  }

  if (
    req.body.name !== undefined &&
    (typeof req.body.name !== "string" || !req.body.name.trim())
  ) {
    res.status(400).json(apiError(400, "Company name cannot be empty"));
    return;
  }

  const company = await updateCompanyRecord(id, req.body);
  if (!company) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

  res.json(apiSuccess(company));
}

export async function deleteCompany(
  req: TypedRequestBody<Company>,
  res: Response<ApiResponse<CompanyDeleteResult>>,
): Promise<void> {
  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Company ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Company ID is required"));
    return;
  }

  const id = req.params.id;

  if (!(await deleteCompanyRecord(id))) {
    res.status(404).json(apiError(404, "Company not found"));
    return;
  }

  res.json(apiSuccess({ id, deleted: true }));
}
