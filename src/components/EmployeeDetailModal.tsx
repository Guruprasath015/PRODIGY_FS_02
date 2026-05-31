import React from 'react';
import { X, Mail, Phone, Building, Briefcase, DollarSign, Calendar, MapPin, Hash, Pencil } from 'lucide-react';
import type { Employee } from '../lib/database.types';

interface Props {
  employee: Employee;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function EmployeeDetailModal({ employee: emp, onClose, onEdit }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white/20">
              {emp.profile_image ? (
                <img src={emp.profile_image} alt={emp.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 font-bold text-2xl">{emp.full_name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{emp.full_name}</h2>
              <p className="text-slate-300 text-sm">{emp.designation}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200">{emp.employee_id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  emp.status === 'active' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-400/20 text-slate-300'
                }`}>
                  {emp.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Detail icon={Mail} label="Email" value={emp.email} />
            <Detail icon={Phone} label="Phone" value={emp.phone} />
            <Detail icon={Building} label="Department" value={emp.department} />
            <Detail icon={Briefcase} label="Designation" value={emp.designation} />
            <Detail icon={DollarSign} label="Salary" value={`$${emp.salary.toLocaleString()}`} />
            <Detail
              icon={Calendar}
              label="Joining Date"
              value={new Date(emp.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <Detail icon={Hash} label="Employee ID" value={emp.employee_id} />
            {emp.address && (
              <Detail icon={MapPin} label="Address" value={emp.address} />
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Added {new Date(emp.created_at).toLocaleDateString()}</span>
            <span>Updated {new Date(emp.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(emp)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit Employee
          </button>
        </div>
      </div>
    </div>
  );
}
