import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Flame,
  FileSpreadsheet,
  Home,
  Package,
  Users,
  BrainCircuit,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RESPONDER', 'USER'] },
    { label: 'Disaster Management', path: '/disasters', icon: Flame, roles: ['ADMIN', 'RESPONDER', 'USER'] },
    { label: 'Report Incident', path: '/reports', icon: FileSpreadsheet, roles: ['ADMIN', 'RESPONDER', 'USER'] },
    { label: 'Shelters & Relief', path: '/shelters', icon: Home, roles: ['ADMIN', 'RESPONDER', 'USER'] },
    { label: 'Relief Inventory', path: '/resources', icon: Package, roles: ['ADMIN', 'RESPONDER'] },
    { label: 'Responder Dispatch', path: '/assignments', icon: Users, roles: ['ADMIN', 'RESPONDER'] },
    { label: 'AI Intelligence Hub', path: '/ai-insights', icon: BrainCircuit, roles: ['ADMIN', 'RESPONDER', 'USER'] },
  ];

  const filteredNav = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Emergency System Alert Bar */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-red-900/40 px-4 py-2 text-xs font-semibold flex items-center justify-between text-red-200">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="tracking-wide">AI EMERGENCY DEFENSE NETWORK: ACTIVE MONITORING</span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-slate-400 font-normal">
          <span className="flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> PostgreSQL Ready</span>
          <span className="flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> JWT Secured</span>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 glass-panel border-r border-slate-800/80 p-5 sticky top-0 h-screen z-30 justify-between">
          <div>
            {/* App Logo */}
            <div className="flex items-center space-x-3 mb-8 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white tracking-tight leading-tight">RESCUE AI</h1>
                <p className="text-[10px] uppercase tracking-wider text-sky-400 font-semibold">Disaster Response</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-950'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer */}
          {user && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-sky-400 shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <Badge variant="role" value={user.role} className="mt-0.5 text-[9px] py-0" />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Header & Drawer Overlay */}
        <div className="lg:hidden flex-1 flex flex-col min-w-0">
          <header className="glass-panel border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 text-sky-400" />
                <span className="font-bold text-white text-sm">RESCUE AI</span>
              </div>
            </div>
            {user && <Badge variant="role" value={user.role} />}
          </header>

          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-30 bg-slate-950/90 backdrop-blur-md pt-20 px-6 pb-6 overflow-y-auto">
              <nav className="space-y-2">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium text-base ${
                        isActive ? 'bg-sky-600/30 text-sky-400 border border-sky-500/40' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
