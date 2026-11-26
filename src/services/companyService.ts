import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../models/company";
import { pool } from "../config/databaseSettings";

type CompanyRow = Omit<Company, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  contactIds: string[];
};

const COMPANY_COLUMNS = `
  company_record.id::text AS id,
  company_record.name,
  company_record.industry,
  company_record.website,
  company_record.phone,
  company_record.address,
  ARRAY(
    SELECT contact.id::text
    FROM contacts AS contact
    WHERE contact.company_id = company_record.id
    ORDER BY contact.created_at, contact.id
  ) AS "contactIds",
  company_record.created_at AS "createdAt",
  company_record.updated_at AS "updatedAt"
`;

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? undefined,
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    contactIds: row.contactIds,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCompanies(): Promise<Company[]> {
  const result = await pool.query<CompanyRow>(`
    SELECT ${COMPANY_COLUMNS}
    FROM companies AS company_record
    ORDER BY company_record.created_at, company_record.id
  `);
  return result.rows.map(toCompany);
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  const result = await pool.query<CompanyRow>(
    `SELECT ${COMPANY_COLUMNS}
     FROM companies AS company_record
     WHERE lower(company_record.id::text) = lower($1)`,
    [id],
  );
  return result.rows[0] ? toCompany(result.rows[0]) : undefined;
}

export async function createCompany(
  input: CreateCompanyInput,
): Promise<Company> {
  const result = await pool.query<CompanyRow>(
    `WITH inserted AS (
       INSERT INTO companies (name, industry, website, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *
     )
     SELECT ${COMPANY_COLUMNS}
     FROM inserted AS company_record`,
    [
      input.name,
      input.industry ?? null,
      input.website ?? null,
      input.phone ?? null,
      input.address ?? null,
    ],
  );
  return toCompany(result.rows[0]);
}

export async function updateCompany(
  id: string,
  input: UpdateCompanyInput,
): Promise<Company | undefined> {
  const fields: Array<[keyof UpdateCompanyInput, string]> = [
    ["name", "name"],
    ["industry", "industry"],
    ["website", "website"],
    ["phone", "phone"],
    ["address", "address"],
  ];
  const updates = fields.filter(([field]) =>
    Object.prototype.hasOwnProperty.call(input, field),
  );
  const values = updates.map(([field]) => input[field] ?? null);
  const assignments = updates.map(
    ([, column], index) => `${column} = $${index + 2}`,
  );
  assignments.push("updated_at = NOW()");

  const result = await pool.query<CompanyRow>(
    `WITH updated AS (
       UPDATE companies
       SET ${assignments.join(", ")}
       WHERE id::text = $1
       RETURNING *
     )
     SELECT ${COMPANY_COLUMNS}
     FROM updated AS company_record`,
    [id, ...values],
  );
  return result.rows[0] ? toCompany(result.rows[0]) : undefined;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM companies WHERE id::text = $1 RETURNING id",
    [id],
  );
  return result.rowCount !== null && result.rowCount > 0;
}
