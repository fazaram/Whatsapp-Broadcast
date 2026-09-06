import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatPhoneNumber, generateWhatsAppLink, personalizeMessage } from '../utils/phoneFormatter';
import type { SendStatus, Contact } from '../types';
import { Search, Plus, Trash2, CheckCircle2, MessageCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Contacts: React.FC = () => {
  const { contacts, template, addContact, deleteContact, updateContactStatus } = useAppStore();
  
  // Local states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SendStatus | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sending state
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [confirmSendContact, setConfirmSendContact] = useState<Contact | null>(null);
  
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' ? true : c.status === filterStatus;
      return matchSearch && matchStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchTerm, filterStatus]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || (!newPhone.trim() && !newEmail.trim())) {
      toast.error('Mohon isi Nomor WA atau Email');
      return;
    }
    
    addContact({
      name: newName.trim(),
      phone: newPhone.trim() ? formatPhoneNumber(newPhone) : '',
      email: newEmail.trim() || undefined,
    });
    
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setShowAddModal(false);
    toast.success('Kontak ditambahkan');
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const initiateSend = (contact: Contact) => {
    if (contact.status === 'Sudah Dikirim') {
      if (!window.confirm(`${contact.name} sudah dikirim sebelumnya. Lanjutkan mengirim ulang?`)) {
        return;
      }
    }
    setActiveContact(contact);
  };

  const handleOpenWhatsApp = () => {
    if (!activeContact) return;
    const msg = personalizeMessage(template.content, activeContact.name, activeContact.phone || '-');
    
    if (activeContact.phone) {
      const link = generateWhatsAppLink(activeContact.phone, msg);
      window.open(link, '_blank');
    } else if (activeContact.email) {
      const link = `mailto:${activeContact.email}?subject=${encodeURIComponent('Pesan dari ' + window.location.hostname)}&body=${encodeURIComponent(msg)}`;
      window.open(link, '_blank');
    }
    
    // Transition to confirmation state
    setConfirmSendContact(activeContact);
    setActiveContact(null);
  };

  const handleConfirmSend = (status: SendStatus) => {
    if (!confirmSendContact) return;
    updateContactStatus(confirmSendContact.id, status);
    setConfirmSendContact(null);
    toast.success(`Status diperbarui menjadi ${status}`);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Hapus ${selectedIds.size} kontak terpilih?`)) {
      selectedIds.forEach(id => deleteContact(id));
      setSelectedIds(new Set());
      toast.success('Kontak dihapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kontak
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau nomor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Belum Dikirim', 'Sudah Dikirim'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-800">{selectedIds.size} kontak dipilih</span>
          <button 
            onClick={handleDeleteSelected}
            className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kontak (WA / Email)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada kontak yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {contact.phone && <div className="text-sm">WA: {contact.phone}</div>}
                      {contact.email && <div className="text-sm">Email: {contact.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        contact.status === 'Sudah Dikirim' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => initiateSend(contact)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          contact.status === 'Sudah Dikirim' 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {contact.status === 'Sudah Dikirim' ? 'Kirim Ulang' : (contact.phone ? 'Kirim WA' : 'Kirim Email')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Kontak</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (Opsional jika ada Email)</label>
                <input 
                  type="text" 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opsional jika ada WA)</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Send Modal */}
      {activeContact && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
              Preview Pesan
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Penerima:</p>
              <p className="font-medium">{activeContact.name}</p>
              {activeContact.phone && <p className="font-medium text-sm text-gray-600">WA: {activeContact.phone}</p>}
              {activeContact.email && <p className="font-medium text-sm text-gray-600">Email: {activeContact.email}</p>}
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 text-sm text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {personalizeMessage(template.content, activeContact.name, activeContact.phone || '-')}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setActiveContact(null)} 
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleOpenWhatsApp}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {activeContact.phone ? 'Buka WhatsApp' : 'Buka Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Send Modal */}
      {confirmSendContact && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Aplikasi Telah Dibuka</h2>
            <p className="text-gray-600 mb-6">
              Apakah kamu sudah menekan tombol <strong>Send / Kirim</strong> di WhatsApp / Email untuk <strong>{confirmSendContact.name}</strong>?
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={() => handleConfirmSend('Belum Dikirim')}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Belum Dikirim
              </button>
              <button 
                onClick={() => handleConfirmSend('Sudah Dikirim')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ya, Sudah Dikirim
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
