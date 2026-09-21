import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Boxes, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { authApi } from "../../api/authApi";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

const forgotSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.forgotPassword(data.email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm border border-gray-200 text-left">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-2xl bg-[#111111] text-white mb-3">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Reset Your Password</h1>
          <p className="text-xs text-gray-500 mt-1">StockFlow Account Security & Recovery</p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-gray-100 border border-gray-800 text-gray-900 text-sm flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-gray-900" />
              <div>
                <p className="font-bold text-gray-900 text-base">Check Your Inbox</p>
                <p className="text-xs text-gray-600 mt-1">
                  If an account exists for this email address, we'll send a password reset link shortly.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              The link expires in 30 minutes. Please also check your spam or junk folder.
            </p>

            <Link to="/login" className="inline-block w-full">
              <Button variant="outline" className="w-full py-3">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <p className="text-xs text-gray-600 mb-2">
              Enter your registered email address below. We will send you a secure, time-limited link to reset your password.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-gray-900" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Account Email Address"
              placeholder="e.g. user@organization.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              {...register("email")}
              error={errors.email?.message}
            />

            <Button variant="primary" type="submit" isLoading={isLoading} className="mt-2 w-full py-3">
              Send Reset Link
            </Button>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-gray-500 hover:text-[#111111] flex items-center justify-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
