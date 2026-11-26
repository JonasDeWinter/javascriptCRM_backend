import type { Response } from "express";
import type { ApiResponse } from "../utils/apiResponse";
import { apiError, apiSuccess } from "../utils/apiResponse";
import type {
  Contact,
  ContactData,
  UpdateContactInput,
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
): Promise<void> {
  return getContacts().then((contacts) => {
    res.json(apiSuccess(contacts));
  });
}

export async function getContact(
  req: TypedRequestBody<ContactData>,
  res: Response<ApiResponse<Contact>>,
): Promise<void> {

  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Contact ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Contact ID is required"));
    return;
  }

  const id = req.params.id;

  const contact = await getContactById(id);
  if (!contact) {
    res.status(404).json(apiError(404, "Contact not found"));
    return;
  }

  res.json(apiSuccess(contact));
}

export async function createContact(
  req: TypedRequestBody<ContactData>,
  res: Response<ApiResponse<Contact>>,
): Promise<void> {

  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    res.status(400).json(apiError(400, "A JSON object is required"));
    return;
  }

  const { firstName, lastName } = req.body;
  if (
    typeof firstName !== "string" ||
    !firstName ||
    typeof lastName !== "string" ||
    !lastName
  ) {
    res.status(400).json(apiError(400, "First name and last name are required"));
    return;
  }

  const contact = await createContactRecord(req.body);
  res.status(201).json(apiSuccess(contact));
}

export async function updateContact(
  req: TypedRequestBody<UpdateContactInput>,
  res: Response<ApiResponse<Contact>>,
): Promise<void> {

  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Contact ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Contact ID is required"));
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
    (req.body.firstName !== undefined &&
      (typeof req.body.firstName !== "string" || !req.body.firstName)) ||
    (req.body.lastName !== undefined &&
      (typeof req.body.lastName !== "string" || !req.body.lastName))
  ) {
    res.status(400).json(apiError(400, "Contact names cannot be empty"));
    return;
  }

  const contact = await updateContactRecord(id, req.body);
  if (!contact) {
    res.status(404).json(apiError(404, "Contact not found"));
    return;
  }

  res.json(apiSuccess(contact));
}

export async function deleteContact(
  req: TypedRequestBody<Contact>,
  res: Response<ApiResponse<ContactDeleteResult>>,
): Promise<void> {

  if (typeof req.params.id !== "string" && typeof req.params.id !== "number") {
    res.status(400).json(apiError(400, "Contact ID must be a string or a number"));
    return;
  }

  if (!req.params.id || req.params.id.length === 0) {
    res.status(400).json(apiError(400, "Contact ID is required"));
    return;
  }

  const id = req.params.id;

  if (!(await deleteContactRecord(id))) {
    res.status(404).json(apiError(404, "Contact not found"));
    return;
  }

  res.json(apiSuccess({ id, deleted: true }));
}
