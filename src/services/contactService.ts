import { randomUUID } from "node:crypto";
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
} from "../models/contact";

const contacts = new Map<string, Contact>();

export function seedContacts(): void {
  if (contacts.size > 0) {
    return;
  }

  const sampleContacts: CreateContactInput[] = [
    {
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex.morgan@example.test",
      phone: "555-0101",
      company: "Northstar Design",
    },
    {
      firstName: "Jamie",
      lastName: "Chen",
      email: "jamie.chen@example.test",
      phone: "555-0102",
      company: "Juniper Labs",
    },
    {
      firstName: "Sam",
      lastName: "Rivera",
      email: "sam.rivera@example.test",
      phone: "555-0103",
      company: "Harbor Consulting",
    },
  ];

  sampleContacts.forEach(createContact);
}

export function getContacts(): Contact[] {
  return Array.from(contacts.values());
}

export function getContactById(id: string): Contact | undefined {
  return contacts.get(id);
}

export function createContact(input: CreateContactInput): Contact {
  const now = new Date().toISOString();
  const contact: Contact = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  contacts.set(contact.id, contact);
  return contact;
}

export function updateContact(
  id: string,
  input: UpdateContactInput,
): Contact | undefined {
  const contact = contacts.get(id);

  if (!contact) {
    return undefined;
  }

  const updatedContact: Contact = {
    ...contact,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  contacts.set(id, updatedContact);
  return updatedContact;
}

export function deleteContact(id: string): boolean {
  return contacts.delete(id);
}
