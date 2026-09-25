import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Boxes, User as UserIcon, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../utils/formatters';
import { parseJwt } from '../../utils/jwt';
import { SESSION_EXPIRED_STORAGE_KEY } from '../../constants/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (
      searchParams.get('expired') === 'true' &&
      sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY) === 'true'
    ) {
      sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
      setIsExpired(true);
    }
  }, [location.search]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.login(data);
      login(data.username, res.token, res.mustChangePassword);
      const payload = parseJwt(res.token);
      const userRole = payload?.role;
      if (userRole === "ADMIN") {
        navigate("/admin/overview", { replace: true });
      } else if (userRole === "MANAGER") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/products", { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.status === 401
          ? 'Invalid username or password.'
          : extractErrorMessage(err)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left Panel - Dark Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#050505] flex-col items-start justify-between p-12 relative overflow-hidden">
        {/* Subtle monochrome grid pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{
            backgroundImage: 'linear-gradient(#262626 1px, transparent 1px), linear-gradient(90deg, #262626 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} 
        />
        
        <div className="relative z-10">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626] text-white shadow-md">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">StockFlow</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3]">Enterprise Suite</span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="max-w-sm">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
              Multi-Warehouse Inventory Control
            </h2>
            <p className="text-[#D4D4D4] text-base leading-relaxed font-normal">
              Manage stock, transfers, reconciliation, and orders across multiple warehouses from a single unified platform.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="mt-12 flex flex-col gap-5">
            {[
              { label: 'Real-time Stock Tracking', desc: 'Live inventory across all warehouses' },
              { label: 'Smart Reconciliation', desc: 'Automated physical audit tools' },
              { label: 'Role-Based Access', desc: 'Granular permission management' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-white/70 flex items-center justify-center mt-0.5 shrink-0 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-[#A3A3A3]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-[#737373] tracking-wide">
          &copy; 2026 OmniStock Ecosystem. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Branding Header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-2.5 rounded-xl bg-[#111111] text-white">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-black block">StockFlow</span>
              <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider block">Enterprise Suite</span>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h1 className="text-2xl font-bold text-black mb-1.5 tracking-tight">Sign in to your account</h1>
            <p className="text-sm text-[#525252]">Enter your credentials to access the dashboard</p>
          </div>

          {isExpired && (
            <div className="p-3.5 mb-6 rounded-xl bg-[#F5F5F5] border border-[#D4D4D4] text-[#262626] text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#262626]" />
              Your session expired. Please sign in again.
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 mb-6 rounded-xl bg-[#F5F5F5] border border-black text-black text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-black" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#525252] mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
                <input
                  {...register('username')}
                  type="text"
                  placeholder="Enter username"
                  className={`w-full h-10 pl-10 pr-4 text-sm border rounded-xl bg-white text-black placeholder-[#A3A3A3] focus:outline-none focus:border-black transition-colors ${
                    errors.username ? 'border-black' : 'border-[#E5E5E5]'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs font-semibold text-black">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#525252]">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#737373] hover:text-black transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className={`w-full h-10 pl-10 pr-10 text-sm border rounded-xl bg-white text-black placeholder-[#A3A3A3] focus:outline-none focus:border-black transition-colors ${
                    errors.password ? 'border-black' : 'border-[#E5E5E5]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-black cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-semibold text-black">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full bg-black hover:bg-[#262626] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
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

          <p className="mt-6 text-center text-xs text-[#525252]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline transition-all">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
