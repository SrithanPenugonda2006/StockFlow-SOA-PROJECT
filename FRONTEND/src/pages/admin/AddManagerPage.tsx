import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { adminApi } from "../../api/adminApi";
import { authApi } from "../../api/authApi";
import { warehouseApi } from "../../api/warehouseApi";
import { Warehouse } from "../../types/warehouse";
import {
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

type VerificationStatus = "NOT_VERIFIED" | "OTP_SENT" | "VERIFIED" | "FAILED" | "EMAIL_CHANGED";

export const AddManagerPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);

  // UI State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Explicit State Machine
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("NOT_VERIFIED");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await warehouseApi.getWarehouses();
        setWarehouses(data);
        if (data.length > 0) {
          setSelectedWarehouseIds([data[0].id]);
        }
      } catch (err) {
        console.error("Failed to load warehouses:", err);
        setWarehouses([
          { id: 1, name: "Hyderabad Central Hub", location: "Hyderabad, Telangana" },
          { id: 2, name: "Bengaluru Logistics Park", location: "Bengaluru, Karnataka" },
        ]);
        setSelectedWarehouseIds([1]);
      } finally {
        setLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, []);

  const toggleWarehouse = (id: number) => {
    if (selectedWarehouseIds.includes(id)) {
      if (selectedWarehouseIds.length === 1) {
        return;
      }
      setSelectedWarehouseIds(selectedWarehouseIds.filter((wId) => wId !== id));
    } else {
      setSelectedWarehouseIds([...selectedWarehouseIds, id]);
    }
  };

  const handleSendOtp = async () => {
    setOtpError(null);
    setOtpSuccess(null);
    setEmailFieldError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setEmailFieldError("Please enter a valid email address before requesting OTP.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await authApi.sendOtp(cleanEmail);
      setVerificationStatus("OTP_SENT");
      setOtpSuccess(response.message || `Verification OTP code sent to ${cleanEmail}`);
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      setVerificationStatus("FAILED");
      const msg = err.response?.data?.message || err.message || "Unable to send verification code. Please try again.";
      if (msg.toLowerCase().includes("already registered")) {
        setEmailFieldError("An account with this email already exists.");
      } else {
        setOtpError("Unable to send verification code. Please try again.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    setOtpSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await authApi.verifyOtp(cleanEmail, cleanCode);
      if (response.verified) {
        setVerificationStatus("VERIFIED");
        setOtpSuccess("✓ Email address verified successfully!");
        setOtpError(null);
      } else {
        setVerificationStatus("FAILED");
        setOtpError(response.message || "Invalid verification code. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to verify OTP:", err);
      setVerificationStatus("FAILED");
      setOtpError(err.response?.data?.message || "Invalid verification code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const isFormValid =
    fullName.trim().length > 0 &&
    username.trim().length >= 3 &&
    email.trim().includes("@") &&
    verificationStatus === "VERIFIED" &&
    password.trim().length >= 6 &&
    password === confirmPassword &&
    selectedWarehouseIds.length > 0 &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailFieldError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !email.trim() || !username.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (verificationStatus !== "VERIFIED") {
      setErrorMsg("Please verify the manager's email address before creating the account.");
      return;
    }

    if (!password.trim() || password.trim().length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (selectedWarehouseIds.length === 0) {
      setErrorMsg("Please select at least one assigned warehouse.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.createManager({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        username: username.trim(),
        password: password.trim(),
        role: "MANAGER",
        status,
        warehouseIds: selectedWarehouseIds,
      });

      setSuccessMsg("Manager created successfully.");
      setTimeout(() => {
        navigate("/admin/managers");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to create manager:", err);
      if (err.response?.status === 409) {
        const errorText = typeof err.response?.data === "string" ? err.response?.data : err.response?.data?.message || "";
        if (errorText.toLowerCase().includes("email")) {
          setEmailFieldError("An account with this email already exists.");
        } else {
          setErrorMsg(errorText || "A manager account with these details already exists.");
        }
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to create manager account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/managers")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Managers</span>
          </button>
          <PageHeader
            title="Add New Manager"
            subtitle="Register a warehouse manager, verify email OTP, assign regional warehouses, and create the manager account."
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Card 1: Manager Personal & Contact Details */}
        <Card title="1. Personal & Contact Details">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Input with Integrated OTP Verification UI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">Email Address *</label>
                  {verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. vikram.sharma@stockflow.io"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (verificationStatus !== "NOT_VERIFIED") {
                          setVerificationStatus("EMAIL_CHANGED");
                          setOtpSuccess(null);
                          setOtpError(null);
                        }
                      }}
                      className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                        verificationStatus === "VERIFIED"
                          ? "border-emerald-500/50 focus:border-emerald-500"
                          : emailFieldError
                          ? "border-rose-500/50 focus:border-rose-500"
                          : "border-slate-800 focus:border-indigo-500"
                      }`}
                    />
                  </div>

                  <Button
                    type="button"
                    variant={verificationStatus === "VERIFIED" ? "outline" : "secondary"}
                    disabled={
                      !email.trim().includes("@") ||
                      isSendingOtp ||
                      isVerifyingOtp ||
                      verificationStatus === "VERIFIED"
                    }
                    onClick={handleSendOtp}
                    className="shrink-0 text-xs px-3.5 py-2.5"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : verificationStatus === "VERIFIED" ? (
                      "Verified"
                    ) : verificationStatus === "OTP_SENT" || verificationStatus === "EMAIL_CHANGED" ? (
                      "Resend OTP"
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>

                {emailFieldError && (
                  <span className="text-[11px] text-rose-400 mt-1.5 block font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {emailFieldError}
                  </span>
                )}

                {verificationStatus === "EMAIL_CHANGED" && (
                  <span className="text-[11px] text-amber-400 mt-1.5 block font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Email address changed. Please re-verify with a new OTP.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* OTP Entry Section when OTP is sent */}
            {(verificationStatus === "OTP_SENT" || verificationStatus === "FAILED") && (
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    Enter 6-Digit Email Verification Code
                  </span>
                  <span className="text-[11px] text-slate-400">Sent to {email}</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono text-center tracking-widest focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="button"
                    disabled={otpCode.length !== 6 || isVerifyingOtp}
                    onClick={handleVerifyOtp}
                    className="shrink-0 text-xs px-4"
                  >
                    {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
                  </Button>
                </div>

                {otpSuccess && (
                  <span className="text-xs text-emerald-400 font-medium">{otpSuccess}</span>
                )}
                {otpError && (
                  <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {otpError}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Account Information */}
        <Card title="2. Account Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Username *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. vsharma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Manager Configuration */}
        <Card title="3. Manager Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Assigned Role</label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">MANAGER</span>
                  <span className="text-xs text-slate-400">Operational warehouse access rights</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVE">Active (Can authenticate and manage inventory)</option>
                <option value="INACTIVE">Inactive (Authentication disabled)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Card 4: Warehouse Access */}
        <Card title="4. Warehouse Access">
          <p className="text-xs text-slate-400 mb-4">
            Select one or more warehouses this manager is authorized to monitor, reconcile, and manage.
          </p>

          {loadingWarehouses ? (
            <div className="p-4 text-xs text-slate-500 animate-pulse">Loading warehouses from Inventory Service...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {warehouses.map((w) => {
                const isSelected = selectedWarehouseIds.includes(w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => toggleWarehouse(w.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500/50 text-slate-100"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <WarehouseIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-bold text-sm text-slate-100">{w.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">{w.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/managers")}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            {isSubmitting ? "Creating Manager..." : "Create Manager"}
          </Button>
        </div>
      </form>
    </div>
  );
};
