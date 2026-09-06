import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { personalizeMessage } from '../utils/phoneFormatter';

export const Template: React.FC = () => {
  const { template, updateTemplate } = useAppStore();
  const [content, setContent] = useState(template.content);

  const handleSave = () => {
    updateTemplate(content);
    toast.success('Template berhasil disimpan!');
  };

  const previewBudi = personalizeMessage(content, 'Budi', '628123456789');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Message Template</h1>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Simpan Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Isi Pesan
            </label>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ketik template pesan di sini..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Available Variables</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><code>{'{nama}'}</code> - Akan diganti dengan nama kontak</li>
              <li><code>{'{nomor}'}</code> - Akan diganti dengan nomor WhatsApp kontak</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 flex flex-col">
          <h2 className="text-sm font-medium text-gray-700">Live Preview (Contoh: Budi)</h2>
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 relative overflow-hidden">
            {/* Fake WhatsApp Chat Bubble */}
            <div className="bg-green-100 rounded-lg rounded-tl-none p-3 max-w-[85%] text-gray-800 shadow-sm whitespace-pre-wrap text-sm">
              {previewBudi || <span className="text-gray-400 italic">Preview pesan akan muncul di sini...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
