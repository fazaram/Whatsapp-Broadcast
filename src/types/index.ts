export type SendStatus = 'Belum Dikirim' | 'Sudah Dikirim';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: SendStatus;
  createdAt: number;
}

export interface Template {
  content: string;
  imageAttachment: string | null;
}

export interface AppState {
  contacts: Contact[];
  template: Template;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'status'>) => void;
  updateContactStatus: (id: string, status: SendStatus) => void;
  deleteContact: (id: string) => void;
  updateTemplate: (content: string, imageAttachment?: string | null) => void;
  importContacts: (newContacts: Omit<Contact, 'id' | 'createdAt' | 'status'>[]) => void;
  clearAllData: () => void;
}
