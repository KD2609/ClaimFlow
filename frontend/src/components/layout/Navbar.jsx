import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  LayoutDashboard,
  FileText,
  UserCheck,
  Bot,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Claims Registry', path: '/claims', icon: FileText },
  { name: 'Manual Processing', path: '/manual-processing', icon: UserCheck },
  { name: 'RPA Bot Console', path: '/automated-processing', icon: Bot },
  { name: 'OR Simulation Lab', path: '/simulation-lab', icon: Sparkles },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Desktop Navbar: 3-Section CSS Grid Layout for Symmetrical Horizontal Distribution */}
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center h-[72px] w-full gap-4 xl:gap-6">
          {/* Section 1 (Left): ClaimFlow Branding */}
          <div className="flex items-center justify-start flex-shrink-0">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-teal-800 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-800 tracking-tight whitespace-nowrap">
                ClaimFlow
              </span>
            </Link>
          </div>

          {/* Section 2 (Middle): 5 Navigation Links Centered & Evenly Spaced */}
          <nav className="flex items-center justify-center space-x-1 lg:space-x-1.5 xl:space-x-2.5 2xl:space-x-4 min-w-0 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-1.5 xl:space-x-2 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/70 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Section 3 (Right): Home Link & Live System Status */}
          <div className="flex items-center justify-end space-x-3 xl:space-x-4 flex-shrink-0">
            {/* Link to public homepage */}
            <Link
              to="/"
              title="Return to Home Page"
              className="text-xs text-slate-600 hover:text-teal-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Home
            </Link>

            {/* Live System Indicator */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold whitespace-nowrap shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Activity className="w-3.5 h-3.5" />
              <span>System Online</span>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Bar (<1024px) */}
        <div className="flex lg:hidden items-center justify-between h-16 w-full">
          {/* Left: Branding */}
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">
              ClaimFlow
            </span>
          </Link>

          {/* Right: Home shortcut + Hamburger Button */}
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="text-xs text-slate-600 hover:text-teal-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Home
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <span>Home</span>
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-emerald-700">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Online (No Auth Required)</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;