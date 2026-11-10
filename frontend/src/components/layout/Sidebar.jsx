import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  Bot,
  Sparkles
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Claims Registry', path: '/claims', icon: FileText },
  { name: 'Manual Processing', path: '/manual-processing', icon: UserCheck },
  { name: 'RPA Bot Console', path: '/automated-processing', icon: Bot },
  { name: 'OR Simulation Lab', path: '/simulation-lab', icon: Sparkles },
];

const Sidebar = () => {
  return (
    <aside className="w-60 bg-white text-slate-700 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-200/80 shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Navigation
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
