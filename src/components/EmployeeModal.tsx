import React, { useEffect, useState } from 'react';
import { X, Loader2, User } from 'lucide-react';
import type { Employee, EmployeeInsert } from '../lib/database.types';

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance',
  'Operations', 'Product', 'Design', 'Legal', 'Customer Support',
];

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joining_date: string;
  address: string;
  profile_image: string;
  status: string;
}

const emptyForm: FormData = {
  full_name: '', email: '', phone: '', department: '',
  designation: '', salary: '', joining_date: '', address: '',
  profile_image: '', status: 'active',
};

interface Props {
  employee?: Employee | null;
  onSave: (data: EmployeeInsert) => Promise<{ error: string | null }>;
  onClose: () => void;
}

export default function EmployeeModal({ employee, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        salary: String(employee.salary),
        joining_date: employee.joining_date,
        address: employee.address,
        profile_image: employee.profile_image,
        status: employee.status,
      });
    }
  }, [employee]);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone number';
    if (!form.department) e.department = 'Department is required';
    if (!form.designation.trim()) e.designation = 'Designation is required';
    if (!form.salary) e.salary = 'Salary is required';
    else if (isNaN(Number(form.salary)) || Number(form.salary) <= 0) e.salary = 'Salary must be a positive number';
    if (!form.joining_date) e.joining_date = 'Joining date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const { error } = await onSave({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      department: form.department,
      designation: form.designation.trim(),
      salary: Number(form.salary),
      joining_date: form.joining_date,
      address: form.address.trim(),
      profile_image: form.profile_image.trim(),
      status: form.status,
    });
    if (error) setApiError(error);
    setLoading(false);
  }

  function Field({ label, name, type = 'text', placeholder, required }: {
    label: string; name: keyof FormData; type?: string; placeholder?: string; required?: boolean;
  }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={form[name]}
          onChange={(e) => set(name, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            ${errors[name] ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
        />
        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">
                {employee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-slate-400">
                {employee ? `Editing ${employee.employee_id}` : 'Fill in the employee details below'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {apiError}
            </div>
          )}
          <form id="emp-form" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" name="full_name" placeholder="e.g. John Smith" required />
              </div>
              <Field label="Email Address" name="email" type="email" placeholder="john@company.com" required />
              <Field label="Phone Number" name="phone" placeholder="+1 555 123 4567" required />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Department<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white
                    ${errors.department ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
              <Field label="Designation" name="designation" placeholder="e.g. Senior Engineer" required />
              <Field label="Salary (USD)" name="salary" type="number" placeholder="60000" required />
              <Field label="Joining Date" name="joining_date" type="date" required />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Status<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Field label="Profile Image URL" name="profile_image" placeholder="https://example.com/photo.jpg" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="emp-form"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {employee ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
