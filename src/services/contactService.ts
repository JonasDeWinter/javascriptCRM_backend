import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "../models/contact";
import { pool } from "../config/databaseSettings";

type ContactRow = Omit<Contact, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
  email: string | null;
  phone: string | null;
  company: string | null;
};

const CONTACT_COLUMNS = `
  id::text AS id,
  first_name AS "firstName",
  last_name AS "lastName",
  email,
  phone,
  company,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getContacts(): Promise<Contact[]> {
  const result = await pool.query<ContactRow>(
    `SELECT ${CONTACT_COLUMNS} FROM contacts ORDER BY created_at, id`,
  );
  return result.rows.map(toContact);
}

export async function getContactById(id: string): Promise<Contact | undefined> {
  const result = await pool.query<ContactRow>(
    `SELECT ${CONTACT_COLUMNS} FROM contacts WHERE id::text = $1`,
    [id],
  );
  return result.rows[0] ? toContact(result.rows[0]) : undefined;
}

export async function createContact(
  input: CreateContactInput,
): Promise<Contact> {
  const result = await pool.query<ContactRow>(
    `INSERT INTO contacts (first_name, last_name, email, phone, company)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${CONTACT_COLUMNS}`,
    [
      input.firstName,
      input.lastName,
      input.email ?? null,
      input.phone ?? null,
      input.company ?? null,
    ],
  );
  return toContact(result.rows[0]);
}

export async function updateContact(
  id: string,
  input: UpdateContactInput,
): Promise<Contact | undefined> {
  const fields: Array<[keyof UpdateContactInput, string]> = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
    ["email", "email"],
    ["phone", "phone"],
    ["company", "company"],
  ];
  const updates = fields.filter(([field]) =>
    Object.prototype.hasOwnProperty.call(input, field),
  );
  const values = updates.map(([field]) => input[field] ?? null);
  const assignments = updates.map(
    ([, column], index) => `${column} = $${index + 2}`,
  );
  assignments.push("updated_at = NOW()");

  const result = await pool.query<ContactRow>(
    `UPDATE contacts
     SET ${assignments.join(", ")}
     WHERE id::text = $1
     RETURNING ${CONTACT_COLUMNS}`,
    [id, ...values],
  );
  return result.rows[0] ? toContact(result.rows[0]) : undefined;
}

export async function deleteContact(id: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM contacts WHERE id::text = $1 RETURNING id",
    [id],
  );
  return result.rowCount !== null && result.rowCount > 0;
}
