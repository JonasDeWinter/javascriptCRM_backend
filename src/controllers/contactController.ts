import type { Response } from "express";
import type { ApiResponse } from "../utils/apiResponse";
import { apiError, apiSuccess } from "../utils/apiResponse";
import type {
  Contact,
  ContactData
} from "../models/contact";
import {
  createContact as createContactRecord,
  deleteContact as deleteContactRecord,
  getContactById,
  getContacts,
  updateContact as updateContactRecord,
} from "../services/contactService";
import type { TypedRequestBody } from "../utils/TypedRequestBody";

type ContactDeleteResult = { id: string; deleted: true };

export function listContacts(
  _req: TypedRequestBody<ContactData>,
  res: Response<ApiResponse<Contact[]>>,
): void {
  res.json(apiSuccess(getContacts()));
}

export function getContact(
  req: TypedRequestBody<ContactData>,
  res: Response<ApiResponse<Contact>>,
): void {

  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Contact ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Contact ID is required"));
    return;
  }

  const id = req.params.id;

  const contact = getContactById(id);
  if (!contact) {
    res.status(404).json(apiError(404, "Contact not found"));
    return;
  }

  res.json(apiSuccess(contact));
}

export function createContact(
  req: TypedRequestBody<ContactData>,
  res: Response<ApiResponse<Contact>>,
): void {

  const {firstName, lastName} = req.body;
  if (!firstName || !lastName) {
    res.status(400).json(apiError(400, "First name and last name are required"));
    return;
  }

  res.status(201).json(apiSuccess(createContactRecord(req.body)));
}

export function updateContact(
  req: TypedRequestBody<Contact>,
  res: Response<ApiResponse<Contact>>,
): void {

  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Contact ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Contact ID is required"));
    return;
  }

  const id = req.params.id;
  const contact = updateContactRecord(id, req.body);
  if (!contact) {
    res.status(404).json(apiError(404, "Contact not found"));
    return;
  }

  res.json(apiSuccess(contact));
}

export function deleteContact(
  req: TypedRequestBody<Contact>,
  res: Response<ApiResponse<ContactDeleteResult>>,
): void {

  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Contact ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Contact ID is required"));
    return;
  }

  const id = req.params.id;

  if (!deleteContactRecord(id)) {
    res.status(404).json(apiError(404, "Contact not found"));
    return;
  }

  res.json(apiSuccess({ id, deleted: true }));
}
