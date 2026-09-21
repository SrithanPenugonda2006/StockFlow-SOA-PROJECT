import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Boxes, ShieldAlert, CheckCircle2, ArrowLeft, Lock } from "lucide-react";
import { authApi } from "../../api/authApi";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { PasswordStrengthMeter } from "../../components/auth/PasswordStrengthMeter";
import { Button } from "../../components/common/Button";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenErrorMsg, setTokenErrorMsg] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidating(false);
        setIsValidToken(false);
        setTokenErrorMsg("No password reset token was provided in the URL.");
        return;
      }

      try {
        const res = await authApi.verifyResetToken(token);
        if (res.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setTokenErrorMsg(res.message || "This password reset token is invalid or has expired.");
        }
      } catch (err: any) {
        setIsValidToken(false);
        const msg = err.response?.data?.message || err.response?.data || "Invalid or expired password reset link.";
        setTokenErrorMsg(typeof msg === "string" ? msg : "Invalid or expired password reset link.");
      } finally {
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError("Reset token is missing.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword,
      });
      setIsResetSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to reset password. The link may have expired.";
      setFormError(typeof msg === "string" ? msg : "Password reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-left">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-600/30 text-white mb-3">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create New Password</h1>
          <p className="text-xs text-slate-400 mt-1">StockFlow Account Security</p>
        </div>

        {isValidating ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verifying security token...</p>
          </div>
        ) : isResetSuccess ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div>
                <p className="font-bold text-white text-base">Password Reset Complete!</p>
                <p className="text-xs text-slate-300 mt-1">
                  Your StockFlow account password has been updated successfully.
                </p>
              </div>
            </div>

            <Button variant="primary" onClick={() => navigate("/login")} className="w-full py-3">
              Sign In Now
            </Button>
          </div>
        ) : !isValidToken ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex flex-col items-center gap-3">
              <ShieldAlert className="w-10 h-10 text-rose-400" />
              <div>
                <p className="font-bold text-white text-base">Invalid or Expired Link</p>
                <p className="text-xs text-slate-300 mt-1">
                  {tokenErrorMsg || "This password reset link is invalid or has expired after 30 minutes."}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/forgot-password" className="inline-block w-full">
                <Button variant="primary" className="w-full py-3">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/login" className="inline-block text-xs text-slate-400 hover:text-white transition-colors">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <div>
              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />

            <Button variant="primary" type="submit" isLoading={isSubmitting} className="mt-2 w-full py-3">
              Reset Password
            </Button>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
