import React, { useCallback, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Upload, FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { formatPhoneNumber, isValidPhoneNumber, isValidEmail } from '../utils/phoneFormatter';

interface PreviewContact {
  name: string;
  phone: string;
  email: string;
  valid: boolean;
}

export const Import: React.FC = () => {
  const importContacts = useAppStore((state) => state.importContacts);
  const [preview, setPreview] = useState<PreviewContact[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processData = (data: any[]) => {
    if (data.length === 0) {
      toast.error('File kosong atau format tidak sesuai.');
      return;
    }

    const headers = Object.keys(data[0] || {});
    
    const findKey = (keywords: string[]) => {
      return headers.find(h => keywords.some(k => h.toLowerCase().trim().includes(k)));
    };

    const emailKey = findKey(['email']);
    const firstNameKey = findKey(['first name', 'first_name']);
    const lastNameKey = findKey(['last name', 'last_name']);
    const nameKey = findKey(['name', 'nama']);
    const phoneKey = findKey(['phone', 'nomor', 'wa', 'hp']);

    if (!nameKey && !firstNameKey) {
      toast.error('Gagal mendeteksi kolom Nama atau First Name.');
      return;
    }

    const processed: PreviewContact[] = data
      .map(row => {
        let name = '';
        if (firstNameKey && row[firstNameKey]) {
          name = String(row[firstNameKey]).trim();
          if (lastNameKey && row[lastNameKey]) {
            name += ' ' + String(row[lastNameKey]).trim();
          }
        } else if (nameKey && row[nameKey]) {
          name = String(row[nameKey]).trim();
        }

        const rawPhone = phoneKey && row[phoneKey] ? String(row[phoneKey]).trim() : '';
        const phone = rawPhone ? formatPhoneNumber(rawPhone) : '';
        
        const email = emailKey && row[emailKey] ? String(row[emailKey]).trim() : '';

        const hasValidPhone = phone ? isValidPhoneNumber(phone) : false;
        const hasValidEmail = email ? isValidEmail(email) : false;

        return {
          name,
          phone,
          email,
          valid: (hasValidPhone || hasValidEmail) && name.length >= 2
        };
      })
      .filter(row => row.name); // only keep rows that have at least a name

    setPreview(processed);
  };

  const handleFileUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
        },
        error: () => {
          toast.error('Gagal membaca file CSV');
        }
      });
    } else if (['xls', 'xlsx'].includes(ext || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
          processData(excelData);
        } catch (error) {
          toast.error('Gagal membaca file Excel');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Format file tidak didukung. Gunakan .csv atau .xlsx');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleConfirmImport = () => {
    const validContacts = preview.filter(p => p.valid).map(p => ({
      name: p.name,
      phone: p.phone,
      email: p.email,
    }));

    if (validContacts.length === 0) {
      toast.error('Tidak ada data valid untuk diimport.');
      return;
    }

    importContacts(validContacts);
    toast.success(`${validContacts.length} kontak berhasil diimport!`);
    setPreview([]); // Reset after successful import
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Import Contacts</h1>

      {!preview.length ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <FileUp className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Drag and drop file Anda di sini</h3>
          <p className="text-sm text-gray-500 mb-4">Mendukung format .CSV dan .XLSX</p>
          
          <div className="relative inline-block">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Pilih File
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Format yang didukung:</h4>
            <div className="flex justify-center text-sm text-gray-500">
              <table className="border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 border-r border-gray-200">Nama</th>
                    <th className="px-4 py-2">Nomor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border-r border-gray-200">Budi</td>
                    <td className="px-4 py-2">08123456789</td>
                  </tr>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-2 border-r border-gray-200">Andi</td>
                    <td className="px-4 py-2">628987654321</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Preview Import</h2>
              <p className="text-sm text-gray-500">
                Ditemukan <span className="font-bold">{preview.length}</span> baris. 
                <span className="text-green-600 font-bold ml-2">{preview.filter(p => p.valid).length} Valid</span>
                <span className="text-red-600 font-bold ml-2">{preview.filter(p => !p.valid).length} Tidak Valid</span>
              </p>
            </div>
            <div className="space-x-3">
              <button 
                onClick={() => setPreview([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                disabled={preview.filter(p => p.valid).length === 0}
              >
                Import Data Valid
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">WhatsApp (Formatted)</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preview.map((row, idx) => (
                    <tr key={idx} className={row.valid ? 'hover:bg-gray-50' : 'bg-red-50'}>
                      <td className="px-6 py-3 text-sm text-gray-900">{row.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{row.phone || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{row.email || '-'}</td>
                      <td className="px-6 py-3 text-sm">
                        {row.valid ? (
                          <span className="inline-flex items-center text-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-700">
                            <AlertCircle className="w-4 h-4 mr-1" /> Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
