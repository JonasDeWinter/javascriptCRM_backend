export interface CompanyData {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface Company extends CompanyData {
  id: string;
  contactIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateCompanyInput = CompanyData;
export type UpdateCompanyInput = Partial<CompanyData>;
