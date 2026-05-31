import React, { useEffect, useState } from 'react';
import { Users, UserCheck, TrendingUp, Calendar, ArrowUpRight, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Employee } from '../lib/database.types';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  deptBreakdown: Record<string, number>;
  recent: Employee[];
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0, active: 0, inactive: 0, deptBreakdown: {}, recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const deptBreakdown: Record<string, number> = {};
        data.forEach((e) => {
          deptBreakdown[e.department] = (deptBreakdown[e.department] || 0) + 1;
        });
        setStats({
          total: data.length,
          active: data.filter((e) => e.status === 'active').length,
          inactive: data.filter((e) => e.status === 'inactive').length,
          deptBreakdown,
          recent: data.slice(0, 5),
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const deptColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
  ];

  const maxDeptCount = Math.max(...Object.values(stats.deptBreakdown), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of your workforce</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={stats.total} sub="All records" color="text-blue-600" />
        <StatCard icon={UserCheck} label="Active Employees" value={stats.active} sub="Currently employed" color="text-emerald-600" />
        <StatCard icon={TrendingUp} label="Inactive Employees" value={stats.inactive} sub="On leave / departed" color="text-amber-600" />
        <StatCard
          icon={Building}
          label="Departments"
          value={Object.keys(stats.deptBreakdown).length}
          sub="Unique departments"
          color="text-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Building className="w-5 h-5 text-slate-600" />
            <h2 className="font-semibold text-slate-800">Department Breakdown</h2>
          </div>
          {Object.keys(stats.deptBreakdown).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No department data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.deptBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([dept, count], i) => (
                  <div key={dept}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 font-medium">{dept}</span>
                      <span className="text-sm text-slate-500">{count} employee{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${deptColors[i % deptColors.length]}`}
                        style={{ width: `${(count / maxDeptCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h2 className="font-semibold text-slate-800">Recent Employees</h2>
          </div>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No employees added yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {emp.profile_image ? (
                      <img src={emp.profile_image} alt={emp.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-semibold text-sm">
                        {emp.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{emp.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{emp.designation} · {emp.department}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    emp.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          {stats.recent.length > 0 && (
            <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View all employees <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
