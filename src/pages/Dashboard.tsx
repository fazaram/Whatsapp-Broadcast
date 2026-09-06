import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Users, Send, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPhoneNumber } from '../utils/phoneFormatter';

export const Dashboard: React.FC = () => {
  const contacts = useAppStore((state) => state.contacts);

  const totalContacts = contacts.length;
  const sentContacts = contacts.filter((c) => c.status === 'Sudah Dikirim').length;
  const unsentContacts = contacts.filter((c) => c.status === 'Belum Dikirim').length;
  
  const progressPercentage = totalContacts > 0 ? Math.round((sentContacts / totalContacts) * 100) : 0;

  const recentContacts = [...contacts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Kontak</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalContacts}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Sudah Dikirim</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{sentContacts}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Belum Dikirim</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{unsentContacts}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Progress</p>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-gray-900">{progressPercentage}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Kontak Terbaru</h2>
          <Link to="/contacts" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat Semua
          </Link>
        </div>
        
        {recentContacts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Belum ada kontak. Silakan tambahkan atau import kontak.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPhoneNumber(contact.phone)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contact.status === 'Sudah Dikirim' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
