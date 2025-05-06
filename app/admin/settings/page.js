'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('reservations');
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const response = await fetch(`/api/export?type=${exportType}&format=${exportFormat}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${exportType} data exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Data Export</h2>
        <p className="text-gray-600 mb-6">
          Export your restaurant data for backup or analysis purposes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="exportType" className="block text-sm font-medium text-gray-700 mb-1">
              Data to Export
            </label>
            <select
              id="exportType"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="reservations">Reservations</option>
              <option value="tables">Tables</option>
              <option value="all">All Data</option>
            </select>
          </div>

          <div>
            <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              id="exportFormat"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center px-4 py-2 bg-[#316160] text-white rounded-lg hover:bg-[#316160]/90 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </button>
      </div>
    </div>
  );
}