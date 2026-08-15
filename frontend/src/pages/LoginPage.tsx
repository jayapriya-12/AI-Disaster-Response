import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Redirect based on role
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.message.includes('Network Error')) {
        setErrorMessage('Cannot connect to backend server. Please verify the backend is running.');
      } else {
        setErrorMessage(err.message || 'Invalid login credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Guest Login Fillers for easy testing
  const fillCredentials = (type: 'admin' | 'responder' | 'user') => {
    setErrorMessage('');
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('AdminPassword123!');
    } else if (type === 'responder') {
      setEmail('responder1@disaster.gov');
      setPassword('Responder123!');
    } else {
      setEmail('user@example.com');
      setPassword('User12345!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 shadow-xl shadow-sky-500/25 mb-3">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI DISASTER RESPONSE</h1>
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mt-1">
            Command & Relief Management Network
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-2">Account Login</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your authorized credentials to access emergency controls.</p>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login to Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Need an emergency reporter account?{' '}
              <Link to="/register" className="font-bold text-sky-400 hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick Demo Login Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-800/50">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5 text-center">
              Quick Test Credentials (One-Click Auto Fill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-2 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 text-[11px] font-medium transition-colors"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('responder')}
                className="px-2 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-medium transition-colors"
              >
                🚒 Responder
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('user')}
                className="px-2 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 text-[11px] font-medium transition-colors"
              >
                👤 Citizen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} title="Reset Account Password">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <KeyRound className="w-6 h-6 text-sky-400 shrink-0" />
            <p className="text-xs text-slate-300">
              Enter your agency email to receive automated security verification instructions.
            </p>
          </div>

          {forgotSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
              ✅ Password reset instructions sent! Please check your inbox or system administrator.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setForgotSuccess(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-500"
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
