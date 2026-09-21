import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { Button } from "../common/Button";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ShieldAlert, CheckCircle2, Lock } from "lucide-react";

interface ForceChangePasswordModalProps {
  isOpen: boolean;
}

export const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({ isOpen }) => {
  const { clearMustChangePassword, logout } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: currentPassword.trim() || undefined,
        newPassword,
      });

      showToast("success", "Password Updated", "Your password has been changed successfully. Welcome to StockFlow!");
      clearMustChangePassword();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to update password. Please check your temporary password.";
      setErrorMsg(typeof msg === "string" ? msg : "Failed to update password.");
      showToast("error", "Update Failed", typeof msg === "string" ? msg : "Password change failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Non-dismissible until password changed
      title="First-Time Login Security Setup"
    >
      <div className="space-y-4 text-left">
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 shrink-0 text-indigo-400 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Temporary Password Change Required</p>
            <p className="mt-0.5 text-slate-300">
              For security, newly created manager accounts must update their temporary password before proceeding.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Current / Temporary Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter temporary password"
            required
          />

          <div>
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
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

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={logout}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white"
            >
              Log Out
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} className="px-6">
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
