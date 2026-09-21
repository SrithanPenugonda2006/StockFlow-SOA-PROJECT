import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

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
      showToast('success', 'Authentication Successful', `Welcome back, ${data.username}!`);

      // Route based on JWT role
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-left">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-600/30 text-white mb-3">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Sign In to StockFlow</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Warehouse Inventory Control System</p>
        </div>

        {isExpired && (
          <div className="p-3.5 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Your session expired. Please sign in again.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Username"
            placeholder="Enter username"
            leftIcon={<UserIcon className="w-4 h-4" />}
            required
            {...register('username')}
            error={errors.username?.message}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Password</span>
            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot Password?
            </Link>
          </div>
          <Input
            label="" 
            type="password"
            placeholder="Enter password"
            leftIcon={<Lock className="w-4 h-4" />}
            required
            {...register('password')}
            error={errors.password?.message}
          />

          <Button variant="primary" type="submit" isLoading={isLoading} className="mt-2 w-full py-3">
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Register New Account
          </Link>
        </div>
      </div>
    </div>
  );
};
