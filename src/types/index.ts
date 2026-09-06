export type SendStatus = 'Belum Dikirim' | 'Sudah Dikirim';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: SendStatus;
  createdAt: number;
}

export interface Template {
  content: string;
}

export interface AppState {
  contacts: Contact[];
  template: Template;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'status'>) => void;
  updateContactStatus: (id: string, status: SendStatus) => void;
  deleteContact: (id: string) => void;
  updateTemplate: (content: string) => void;
  importContacts: (newContacts: Omit<Contact, 'id' | 'createdAt' | 'status'>[]) => void;
  clearAllData: () => void;
}
