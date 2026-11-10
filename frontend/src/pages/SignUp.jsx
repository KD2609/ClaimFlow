import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  UserCheck
} from 'lucide-react';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('ROLE_CLAIM_PROCESSOR');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
            <pattern id="claimflow-signup-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0F766E" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#claimflow-signup-grid)" />
        </svg>

        {/* Faint Floating Document & Shield Motifs */}
        <div className="hidden lg:block absolute top-20 left-24 p-4 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm opacity-60">
          <div className="flex items-center space-x-2 text-teal-700">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-semibold">User Onboarding</span>
          </div>
          <div className="w-24 h-1.5 bg-slate-200 rounded mt-2"></div>
          <div className="w-16 h-1.5 bg-slate-200 rounded mt-1"></div>
        </div>

        <div className="hidden lg:block absolute bottom-24 right-24 p-4 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm opacity-60">
          <div className="flex items-center space-x-2 text-teal-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold">Demo Role Assigned</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Claim Processing Permissions</span>
        </div>
      </div>

      {/* Main Sign Up Card */}
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
            Create Demo Account • Operations Research Platform
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
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Demo Registration Complete!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your demonstration profile has been configured. You can now proceed to login.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-all"
              >
                <span>Proceed to Login</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          ) : (
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                    placeholder="alex@insurance.demo"
                  />
                </div>
              </div>

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
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                    placeholder="Choose username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Demonstration
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50 font-medium text-slate-700"
                  >
                    <option value="ROLE_CLAIM_PROCESSOR">Claim Adjuster (Processor)</option>
                    <option value="ROLE_ADMIN">System Administrator (Admin)</option>
                  </select>
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
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 shadow-sm transition-all mt-4"
              >
                <span>Create Demonstration Account</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </form>
          )}

          {/* Already have an account? Login Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                Login
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

export default SignUp;

