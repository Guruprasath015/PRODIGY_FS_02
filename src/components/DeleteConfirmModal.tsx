import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  employeeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({ employeeName, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Employee</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">{employeeName}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
