import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  ArrowLeft
} from 'lucide-react';

const Login = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  // Initialize from existing session if available, default to admin
  const [selectedRole, setSelectedRole] = useState(() => {
    if (user?.role === 'ROLE_CLAIM_PROCESSOR' || user?.username === 'processor') {
      return 'Adjuster';
    }
    return 'Admin';
  });

  const [username, setUsername] = useState(() => {
    if (user?.role === 'ROLE_CLAIM_PROCESSOR' || user?.username === 'processor') {
      return 'processor';
    }
    return 'admin';
  });

  const [password, setPassword] = useState(() => {
    if (user?.role === 'ROLE_CLAIM_PROCESSOR' || user?.username === 'processor') {
      return 'processor123';
    }
    return 'admin123';
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Dynamically derive the active display role
  const activeRole = selectedRole || (username.toLowerCase() === 'processor' ? 'Adjuster' : 'Admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid credentials');
    }
  };

  const handleQuickDashboardNav = async () => {
    // Ensure active credentials are authenticated and clear any stale previous user
    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleDemoFill = async (userType) => {
    setErrorMessage('');
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      setSelectedRole('Admin');
      // Synchronously switch user session and clear stale previous state
      await login('admin', 'admin123');
    } else {
      setUsername('processor');
      setPassword('processor123');
      setSelectedRole('Adjuster');
      // Synchronously switch user session and clear stale previous state
      await login('processor', 'processor123');
    }
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    const lower = val.trim().toLowerCase();
    if (lower === 'admin') {
      setSelectedRole('Admin');
    } else if (lower === 'processor') {
      setSelectedRole('Adjuster');
    } else if (val.trim()) {
      setSelectedRole(val.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] relative flex flex-col justify-center items-center p-4 overflow-hidden">
      {/* Subtle Abstract Insurance & Workflow Background Illustration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft background gradient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl" />

        {/* Decorative SVG Geometric & Node Network */}
        <svg className="absolute w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="claimflow-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0F766E" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#claimflow-grid)" />
        </svg>

        {/* Faint Floating Document & Shield Motifs */}
        <div className="hidden lg:block absolute top-20 left-24 p-4 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm opacity-60">
          <div className="flex items-center space-x-2 text-teal-700">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-semibold">Claim Intake #CLM-2026</span>
          </div>
          <div className="w-24 h-1.5 bg-slate-200 rounded mt-2"></div>
          <div className="w-16 h-1.5 bg-slate-200 rounded mt-1"></div>
        </div>

        <div className="hidden lg:block absolute bottom-24 right-24 p-4 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm opacity-60">
          <div className="flex items-center space-x-2 text-teal-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold">Policy Verified</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Coverage Ceiling: $50,000</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-sm mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            ClaimFlow
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Insurance Claim Processing & Automation Platform
          </p>
        </div>

        {/* Back to Home Navigation Link */}
        <div className="mb-4 sm:mb-5 flex items-center justify-start">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-[14px] font-medium text-slate-700 hover:text-teal-700 px-2 py-1 -ml-2 rounded-lg hover:bg-teal-50/70 transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-teal-700 group-hover:-translate-x-0.5 transition-all duration-200" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Card Box */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200/90 shadow-sm">
          {/* Active Demo Role Status Box: Dynamically reflects Admin vs Adjuster selection */}
          <div className="mb-4 p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 text-xs flex items-center justify-between transition-all">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">
                Signed in as <strong className="font-bold text-teal-900">{activeRole}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDashboardNav}
              className="font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center space-x-1 transition-colors"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 shadow-sm disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center space-x-1.5">
                  <span>Sign In to ClaimFlow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Instant Demo Fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-medium transition-colors text-center ${
                  activeRole === 'Admin'
                    ? 'border-teal-700 bg-teal-50/70 text-teal-800 font-bold'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Admin (admin / admin123)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('processor')}
                className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-medium transition-colors text-center ${
                  activeRole === 'Adjuster'
                    ? 'border-teal-700 bg-teal-50/70 text-teal-800 font-bold'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Adjuster (processor / ...)
              </button>
            </div>
          </div>

          {/* Don't have an account? Sign Up Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          ClaimFlow System • Operations Research & Process Automation
        </p>
      </div>
    </div>
  );
};

export default Login;
