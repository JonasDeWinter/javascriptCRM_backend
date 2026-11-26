import { randomUUID } from "node:crypto";
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "../models/company";

const companies = new Map<string, Company>();

export function seedCompanies(): void {
  if (companies.size > 0) {
    return;
  }

  const sampleCompanies: CreateCompanyInput[] = [
    {
      name: "Northstar Design",
      industry: "Design",
      website: "https://northstar.example.test",
      phone: "555-0201",
    },
    {
      name: "Juniper Labs",
      industry: "Technology",
      website: "https://juniper.example.test",
      phone: "555-0202",
    },
    {
      name: "Harbor Consulting",
      industry: "Consulting",
      website: "https://harbor.example.test",
      phone: "555-0203",
    },
  ];

  sampleCompanies.forEach(createCompany);
}

export function getCompanies(): Company[] {
  return Array.from(companies.values());
}

export function getCompanyById(id: string): Company | undefined {
  return companies.get(id);
}

export function createCompany(input: CreateCompanyInput): Company {
  const now = new Date().toISOString();
  const company: Company = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  companies.set(company.id, company);
  return company;
}

export function updateCompany(
  id: string,
  input: UpdateCompanyInput,
): Company | undefined {
  const company = companies.get(id);
  if (!company) {
    return undefined;
  }

  const updatedCompany: Company = {
    ...company,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  companies.set(id, updatedCompany);
  return updatedCompany;
}

export function deleteCompany(id: string): boolean {
  return companies.delete(id);
}
