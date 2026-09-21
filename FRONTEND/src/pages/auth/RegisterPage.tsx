import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, User as UserIcon, Mail, KeyRound, CheckCircle2, AlertCircle, XCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { evaluatePasswordStrength, isPasswordStrengthAllowed } from '../../utils/passwordStrength';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .refine((val) => isPasswordStrengthAllowed(val), {
        message: 'Password must be Strong or Very Strong.',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateEmailError, setDuplicateEmailError] = useState<string | null>(null);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email', '');
  const usernameValue = watch('username', '');
  const passwordValue = watch('password', '');
  const confirmPasswordValue = watch('confirmPassword', '');

  // Clear duplicate email error when user edits the email field
  useEffect(() => {
    if (duplicateEmailError) {
      setDuplicateEmailError(null);
    }
  }, [emailValue]);

  const passwordStrength = evaluatePasswordStrength(passwordValue);
  const isPasswordAllowed = isPasswordStrengthAllowed(passwordValue);
  const isPasswordsMatching = confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;
  const hasConfirmPassword = confirmPasswordValue.length > 0;

  const isFormValid =
    usernameValue.length >= 3 &&
    emailValue.length > 0 &&
    isEmailVerified &&
    isPasswordAllowed &&
    isPasswordsMatching;

  const handleSendOtp = async () => {
    if (!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
      showToast('error', 'Please enter a valid email address first.');
      return;
    }

    setSendingOtp(true);
    setErrorMessage(null);
    setDuplicateEmailError(null);

    try {
      await authApi.sendOtp(emailValue);
      setOtpSent(true);
      showToast('success', `Verification OTP sent to ${emailValue}`);
    } catch (err: any) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message || err.message || 'Failed to send OTP.';

      if (status === 409 || apiMessage.toLowerCase().includes('already registered')) {
        setDuplicateEmailError('This email address is already registered.');
      } else {
        setErrorMessage(apiMessage);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      showToast('error', 'OTP must be 6 digits.');
      return;
    }

    setVerifyingOtp(true);
    setErrorMessage(null);

    try {
      await authApi.verifyOtp(emailValue, otpCode);
      setIsEmailVerified(true);
      setVerifiedEmail(emailValue);
      showToast('success', 'Email verified successfully!');
    } catch (err: any) {
      const apiMessage = err.response?.data?.message || 'Incorrect OTP or code expired.';
      showToast('error', apiMessage);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!isEmailVerified) {
      showToast('error', 'Please verify your email address via OTP before registering.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'CUSTOMER',
      });
      showToast('success', 'Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Registration failed.';

      if (status === 409 || msg.toLowerCase().includes('already registered')) {
        setDuplicateEmailError('This email address is already registered.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
      <div className="w-full max-w-[900px] bg-white border border-gray-200 rounded-2xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 shadow-2xl text-left mx-auto my-auto box-border">
        {/* Top-Left Back to Login Button */}
        <div className="flex items-center justify-between mb-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5F5F5] hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#666666]" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#111111] text-white mb-1.5">
            <Boxes className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900">Create Account</h1>
          <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5">Register for StockFlow SaaS Platform</p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-3 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-gray-900" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5 sm:gap-3">
          <Input
            label="Username"
            placeholder="Choose username"
            leftIcon={<UserIcon className="w-4 h-4" />}
            required
            {...register('username')}
            error={errors.username?.message}
          />

          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  disabled={isEmailVerified}
                  required
                  {...register('email')}
                  error={duplicateEmailError || errors.email?.message}
                />
              </div>
              {!isEmailVerified && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleSendOtp}
                  isLoading={sendingOtp}
                  className="shrink-0 mb-0.5 min-w-[120px] py-2"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </Button>
              )}
            </div>

            {duplicateEmailError && (
              <div className="p-2.5 bg-gray-100 border border-gray-800 rounded-lg text-gray-900 text-xs flex items-center gap-2 font-medium mt-0.5">
                <XCircle className="w-4 h-4 text-gray-900 shrink-0" aria-hidden="true" />
                <span>{duplicateEmailError}</span>
              </div>
            )}

            {isEmailVerified && (
              <div className="p-2.5 bg-gray-100 border border-gray-800 rounded-lg text-gray-800 text-xs flex items-center gap-2 font-semibold mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-gray-900 shrink-0" />
                <span>Email Verified ({verifiedEmail})</span>
              </div>
            )}
          </div>

          {/* OTP Input & Verification Step */}
          {otpSent && !isEmailVerified && (
            <div className="p-3 bg-[#F7F8FA]/90 border border-[#D4D4D4]/30 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-[#666666] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#666666]" /> Enter 6-Digit OTP Code
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-white border border-gray-200 rounded-lg text-center text-lg tracking-widest font-mono font-bold text-white p-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleVerifyOtp}
                  isLoading={verifyingOtp}
                  disabled={otpCode.length !== 6}
                  className="shrink-0 min-w-[130px] py-2"
                >
                  Verify OTP
                </Button>
              </div>
              <p className="text-xs text-gray-600 font-normal">
                A 6-digit verification code was sent to <strong className="text-gray-600">{emailValue}</strong>.
              </p>
            </div>
          )}

          {/* Password Field */}
          <PasswordInput
            label="Password"
            placeholder="Create password"
            required
            {...register('password')}
            error={errors.password?.message}
          />

          {/* Password Strength Meter & Requirements */}
          <div className="flex flex-col gap-1.5">
            <PasswordStrengthMeter password={passwordValue} />

            {/* Weak Password Block Notice */}
            {passwordValue.length > 0 && !isPasswordAllowed && (
              <div className="p-2.5 rounded-lg bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2 font-medium">
                <XCircle className="w-4 h-4 text-gray-900 shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-bold block">Password is too weak.</span>
                  <span>Please choose a Strong or Very Strong password.</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm password"
              required
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            {/* Password Matching Status */}
            {hasConfirmPassword && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 font-medium transition-all ${
                  isPasswordsMatching
                    ? 'bg-gray-900/10 border-gray-900/30 text-gray-800'
                    : 'bg-gray-900/10 border-gray-900/30 text-gray-900'
                }`}
                aria-live="polite"
              >
                {isPasswordsMatching ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-gray-900 shrink-0" aria-hidden="true" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-900 shrink-0" aria-hidden="true" />
                    <span>Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            disabled={!isFormValid}
            className="mt-1 w-full py-2.5 sm:py-3 text-sm sm:text-base font-bold"
          >
            {isEmailVerified ? 'Register Account' : 'Verify Email to Register'}
          </Button>
        </form>

        <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-200 text-center text-xs text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#666666] hover:text-[#666666] transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
