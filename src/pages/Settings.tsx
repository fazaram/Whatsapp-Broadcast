import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { contacts, template, clearAllData } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = () => {
    if (contacts.length === 0) {
      toast.error('Tidak ada data kontak untuk diexport.');
      return;
    }

    const dataStr = JSON.stringify({ contacts, template }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wa-sender-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Data berhasil diexport!');
  };

  const handleClear = () => {
    clearAllData();
    setShowConfirm(false);
    toast.success('Semua data telah dihapus.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        
        {/* Export Section */}
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Simpan cadangan kontak dan template Anda dalam format JSON.
            </p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>

        {/* Clear Data Section */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg font-semibold text-red-600">Clear All Data</h2>
              <p className="text-sm text-gray-500 mt-1">
                Hapus semua data kontak, template, dan status pengiriman dari LocalStorage. Data yang dihapus tidak bisa dikembalikan.
              </p>
            </div>
            {!showConfirm ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="flex items-center px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Ya, Hapus Semua
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
