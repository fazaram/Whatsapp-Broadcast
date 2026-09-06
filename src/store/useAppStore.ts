import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, SendStatus } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      contacts: [],
      template: {
        content: 'Halo {nama},\n\nKami ingin menginformasikan bahwa promo terbaru kami sudah tersedia.\n\nTerima kasih.',
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
      updateTemplate: (content) =>
        set(() => ({
          template: { content },
        })),
      importContacts: (newContacts) =>
        set((state) => {
          // Prevent duplicates by checking phone numbers
          const existingPhones = new Set(state.contacts.map(c => c.phone));
          const uniqueNew = newContacts.filter(c => !existingPhones.has(c.phone));
          
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
          template: { content: 'Halo {nama},\n\nKami ingin menginformasikan bahwa promo terbaru kami sudah tersedia.\n\nTerima kasih.' },
        })),
    }),
    {
      name: 'whatsapp-sender-storage',
    }
  )
);
