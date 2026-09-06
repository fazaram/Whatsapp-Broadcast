import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, SendStatus } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      contacts: [],
      template: {
        content: 'Halo {nama},\n\nKami ingin menginformasikan bahwa promo terbaru kami sudah tersedia.\n\nTerima kasih.',
        imageAttachment: null,
      },
      addContact: (contact) =>
        set((state) => ({
          contacts: [
            ...state.contacts,
            {
              ...contact,
              id: crypto.randomUUID(),
              status: 'Belum Dikirim' as SendStatus,
              createdAt: Date.now(),
            },
          ],
        })),
      updateContactStatus: (id, status) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),
      updateTemplate: (content, imageAttachment) =>
        set((state) => ({
          template: { 
            content, 
            imageAttachment: imageAttachment !== undefined ? imageAttachment : state.template.imageAttachment 
          },
        })),
      importContacts: (newContacts) =>
        set((state) => {
          // Prevent duplicates by checking phone numbers or emails
          const existingIdentifiers = new Set(
            state.contacts.flatMap(c => [c.phone, c.email].filter(Boolean))
          );
          
          const uniqueNew = newContacts.filter(c => {
            if (c.phone && existingIdentifiers.has(c.phone)) return false;
            if (c.email && existingIdentifiers.has(c.email)) return false;
            return true;
          });
          
          const mappedNew = uniqueNew.map(c => ({
            ...c,
            id: crypto.randomUUID(),
            status: 'Belum Dikirim' as SendStatus,
            createdAt: Date.now(),
          }));

          return {
            contacts: [...state.contacts, ...mappedNew],
          };
        }),
      clearAllData: () =>
        set(() => ({
          contacts: [],
          template: { 
            content: 'Halo {nama},\n\nKami ingin menginformasikan bahwa promo terbaru kami sudah tersedia.\n\nTerima kasih.',
            imageAttachment: null
          },
        })),
    }),
    {
      name: 'whatsapp-sender-storage',
    }
  )
);
