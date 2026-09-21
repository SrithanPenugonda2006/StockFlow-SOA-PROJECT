import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, Lock, User as UserIcon, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isExpired = searchParams.get('expired') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.login(data);
      login(data.username, res.token, res.mustChangePassword);
      showToast('success', 'Welcome back!', `Signed in as ${data.username}`);
      const payload = JSON.parse(atob(res.token.split('.')[1]));
      if (payload.role === 'CUSTOMER') {
        navigate('/customer/products');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data || 'Invalid credentials or connection error';
      setErrorMessage(typeof msg === 'string' ? msg : 'Authentication failed');
      showToast('error', 'Login Failed', typeof msg === 'string' ? msg : 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050505] flex-col items-start justify-between p-12 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2.5 rounded-xl bg-[#111111] text-white">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">StockFlow</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">Enterprise Suite</span>
            </div>
          </div>
          <div className="max-w-sm">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              Multi-Warehouse Inventory Control
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Manage stock, transfers, reconciliation, and orders across multiple warehouses from a single unified platform.
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-4">
            {[
              { label: 'Real-time Stock Tracking', desc: 'Live inventory across all warehouses' },
              { label: 'Smart Reconciliation', desc: 'Automated physical audit tools' },
              { label: 'Role-Based Access', desc: 'Granular permission management' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#111111]/20 border border-[#D4D4D4]/40 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#111111]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-gray-600">
          &copy; 2026 OmniStock Ecosystem. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-2 rounded-xl bg-[#111111] text-white">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-gray-900">StockFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
            <p className="text-sm text-gray-500">Enter your credentials to access the dashboard</p>
          </div>

          {isExpired && (
            <div className="p-3.5 mb-6 rounded-lg bg-gray-100 border border-gray-600 text-gray-700 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-gray-700" />
              Your session expired. Please sign in again.
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 mb-6 rounded-lg bg-gray-100 border border-gray-800 text-gray-900 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-gray-900" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  {...register('username')}
                  type="text"
                  placeholder="Enter username"
                  className={`w-full h-10 pl-10 pr-4 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-[#111111] transition-all ${
                    errors.username ? 'border-gray-400' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-gray-900">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#555555] hover:text-black transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className={`w-full h-10 pl-10 pr-10 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-[#111111] transition-all ${
                    errors.password ? 'border-gray-400' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#555555] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-gray-900">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full bg-[#111111] hover:bg-[#2A2A2A] text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[#111111] hover:text-[#111111] transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
