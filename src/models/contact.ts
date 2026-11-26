export interface ContactData {
  firstName: Required<string>;
  lastName: Required<string>;
  email?: string;
  phone?: string;
  company?: string;
}

export interface Contact extends ContactData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateContactInput = ContactData;
export type UpdateContactInput = Partial<ContactData>;
