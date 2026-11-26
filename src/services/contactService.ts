import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "../models/contact";
import { pool } from "../config/databaseSettings";

type ContactRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const CONTACT_COLUMNS = `
  contact.id::text AS id,
  contact.first_name AS "firstName",
  contact.last_name AS "lastName",
  contact.email,
  contact.phone,
  contact.company_id::text AS "companyId",
  COALESCE(company_record.name, contact.company) AS company,
  contact.created_at AS "createdAt",
  contact.updated_at AS "updatedAt"
`;

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    companyId: row.companyId ?? undefined,
    company: row.company ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getContacts(): Promise<Contact[]> {
  const result = await pool.query<ContactRow>(`
    SELECT ${CONTACT_COLUMNS}
    FROM contacts AS contact
    LEFT JOIN companies AS company_record ON company_record.id = contact.company_id
    ORDER BY contact.created_at, contact.id
  `);
  return result.rows.map(toContact);
}

export async function getContactById(id: string): Promise<Contact | undefined> {
  const result = await pool.query<ContactRow>(
    `SELECT ${CONTACT_COLUMNS}
     FROM contacts AS contact
     LEFT JOIN companies AS company_record ON company_record.id = contact.company_id
     WHERE contact.id::text = $1`,
    [id],
  );
  return result.rows[0] ? toContact(result.rows[0]) : undefined;
}

export async function createContact(
  input: CreateContactInput,
): Promise<Contact> {
  const result = await pool.query<ContactRow>(
    `WITH inserted AS (
       INSERT INTO contacts (first_name, last_name, email, phone, company_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *
     )
     SELECT ${CONTACT_COLUMNS}
     FROM inserted AS contact
     LEFT JOIN companies AS company_record ON company_record.id = contact.company_id`,
    [
      input.firstName,
      input.lastName,
      input.email ?? null,
      input.phone ?? null,
      input.companyId ?? null,
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
    ["companyId", "company_id"],
  ];
  const updates = fields.filter(([field]) =>
    Object.prototype.hasOwnProperty.call(input, field),
  );
  const values = updates.map(([field]) => input[field] ?? null);
  const assignments = updates.map(
    ([, column], index) => `${column} = $${index + 2}`,
  );
  if (updates.some(([field]) => field === "companyId")) {
    assignments.push("company = NULL");
  }
  assignments.push("updated_at = NOW()");

  const result = await pool.query<ContactRow>(
    `WITH updated AS (
       UPDATE contacts
       SET ${assignments.join(", ")}
       WHERE id::text = $1
       RETURNING *
     )
     SELECT ${CONTACT_COLUMNS}
     FROM updated AS contact
     LEFT JOIN companies AS company_record ON company_record.id = contact.company_id`,
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
