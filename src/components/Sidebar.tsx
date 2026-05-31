import React from 'react';
import {
  LayoutDashboard, Users, LogOut, Building2, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 text-white z-30 transition-all duration-300 flex flex-col
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">EMS Portal</p>
                <p className="text-xs text-slate-400">Management System</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-white"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative group
                ${currentPage === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {currentPage === id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {!collapsed && currentPage === id && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition">
                  {label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-slate-700 p-4">
          {!collapsed && profile && (
            <div className="mb-3 px-1">
              <p className="text-xs font-semibold text-white truncate">{profile.username}</p>
              <p className="text-xs text-slate-400 truncate">{profile.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded-full capitalize">
                {profile.role}
              </span>
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-lg transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
