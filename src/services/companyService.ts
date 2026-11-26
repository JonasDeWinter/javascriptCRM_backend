import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../models/company";
import { pool } from "../config/database";

type CompanyRow = Omit<Company, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
};

const COMPANY_COLUMNS = `
  id::text AS id,
  name,
  industry,
  website,
  phone,
  address,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? undefined,
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCompanies(): Promise<Company[]> {
  const result = await pool.query<CompanyRow>(
    `SELECT ${COMPANY_COLUMNS} FROM companies ORDER BY created_at, id`,
  );
  return result.rows.map(toCompany);
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  const result = await pool.query<CompanyRow>(
    `SELECT ${COMPANY_COLUMNS} FROM companies WHERE id::text = $1`,
    [id],
  );
  return result.rows[0] ? toCompany(result.rows[0]) : undefined;
}

export async function createCompany(
  input: CreateCompanyInput,
): Promise<Company> {
  const result = await pool.query<CompanyRow>(
    `INSERT INTO companies (name, industry, website, phone, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COMPANY_COLUMNS}`,
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
    `UPDATE companies
     SET ${assignments.join(", ")}
     WHERE id::text = $1
     RETURNING ${COMPANY_COLUMNS}`,
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
