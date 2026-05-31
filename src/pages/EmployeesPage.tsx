import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus, Search, Filter, Download, ChevronLeft, ChevronRight,
  Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronDown, X, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Employee, EmployeeInsert } from '../lib/database.types';
import EmployeeModal from '../components/EmployeeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import Toast from '../components/Toast';

const DEPARTMENTS = [
  'All Departments', 'Engineering', 'Marketing', 'Sales', 'Human Resources',
  'Finance', 'Operations', 'Product', 'Design', 'Legal', 'Customer Support',
];
const PAGE_SIZE = 10;

type SortField = 'full_name' | 'joining_date' | 'salary' | 'department';
type SortDir = 'asc' | 'desc';

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('joining_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  async function loadEmployees() {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order(sortField, { ascending: sortDir === 'asc' });
    if (error) showToast('Failed to load employees', 'error');
    else setEmployees(data || []);
    setLoading(false);
  }

  useEffect(() => { loadEmployees(); }, [sortField, sortDir]);

  // Close dept dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setShowDeptDropdown(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      e.full_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All Departments' || e.department === deptFilter;
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
  }

  async function handleSave(data: EmployeeInsert) {
    if (editEmployee) {
      const { error } = await supabase.from('employees').update(data).eq('id', editEmployee.id);
      if (error) return { error: error.message };
      showToast('Employee updated successfully', 'success');
    } else {
      const { error } = await supabase.from('employees').insert({ ...data, created_by: user?.id });
      if (error) return { error: error.message };
      showToast('Employee added successfully', 'success');
    }
    setShowModal(false);
    setEditEmployee(null);
    loadEmployees();
    return { error: null };
  }

  async function handleDelete() {
    if (!deleteEmployee) return;
    setDeleteLoading(true);
    const { error } = await supabase.from('employees').delete().eq('id', deleteEmployee.id);
    setDeleteLoading(false);
    if (error) { showToast('Failed to delete employee', 'error'); return; }
    showToast('Employee deleted successfully', 'success');
    setDeleteEmployee(null);
    loadEmployees();
  }

  function exportCSV() {
    const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Salary', 'Joining Date', 'Status'];
    const rows = filtered.map((e) => [
      e.employee_id, e.full_name, e.email, e.phone, e.department,
      e.designation, e.salary, e.joining_date, e.status
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => { setEditEmployee(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, ID, email, designation..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department */}
          <div className="relative" ref={deptRef}>
            <button
              onClick={() => setShowDeptDropdown((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 transition whitespace-nowrap min-w-[160px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                {deptFilter}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showDeptDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDeptFilter(d); setShowDeptDropdown(false); setPage(1); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition ${
                      deptFilter === d ? 'text-blue-600 font-medium bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No employees found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort('department')}
                  >
                    <span className="flex items-center gap-1.5">Department <SortIcon field="department" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Designation</th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 hidden lg:table-cell"
                    onClick={() => toggleSort('salary')}
                  >
                    <span className="flex items-center gap-1.5">Salary <SortIcon field="salary" /></span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 hidden xl:table-cell"
                    onClick={() => toggleSort('joining_date')}
                  >
                    <span className="flex items-center gap-1.5">Joined <SortIcon field="joining_date" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {emp.profile_image ? (
                            <img src={emp.profile_image} alt={emp.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-600 font-bold text-sm">{emp.full_name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{emp.full_name}</p>
                          <p className="text-xs text-slate-400">{emp.employee_id} · {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{emp.designation}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                      ${emp.salary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden xl:table-cell">
                      {new Date(emp.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        emp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {emp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewEmployee(emp)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditEmployee(emp); setShowModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteEmployee(emp)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 text-sm rounded-lg transition font-medium ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          employee={editEmployee}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditEmployee(null); }}
        />
      )}
      {deleteEmployee && (
        <DeleteConfirmModal
          employeeName={deleteEmployee.full_name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteEmployee(null)}
          loading={deleteLoading}
        />
      )}
      {viewEmployee && (
        <EmployeeDetailModal
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
          onEdit={(emp) => { setViewEmployee(null); setEditEmployee(emp); setShowModal(true); }}
        />
      )}
    </div>
  );
}
