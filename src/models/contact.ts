export interface ContactData {
  firstName: Required<string>;
  lastName: Required<string>;
  email?: string;
  phone?: string;
  companyId?: string | null;
}

export interface Contact extends Omit<ContactData, "companyId"> {
  companyId?: string;
  company?: string;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateContactInput = ContactData;
export type UpdateContactInput = Partial<ContactData>;
