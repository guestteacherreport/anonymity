"use client";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import PageLoader from "@/app/components/PageLoader";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { DISPLAY_NAME_MAX_LENGTH, EMAIL_MAX_LENGTH, validateDisplayName, validateEmail } from "@/lib/account";
import { validatePassword } from "@/lib/password";

type Account = {
  full_name: string;
  email: string;
  hasPassword: boolean;
  pendingEmail: { email: string; expiresAt: string } | null;
};

const cardClass =
  "rounded-2xl border border-[rgba(1,113,249,0.10)] bg-white p-6 shadow-[0_2px_9.9px_0_rgba(0,0,0,0.06)] sm:p-10";
const labelClass = "flex flex-col gap-2 font-inter text-sm font-medium text-[#212121]";
const inputClass =
  "rounded-xl border border-[#D9DEE7] px-4 py-3 font-normal outline-none transition focus:border-[#0171F9] focus:ring-2 focus:ring-[#0171F9]/15";
const buttonClass =
  "mt-6 rounded-xl bg-[#0171F9] px-7 py-3.5 font-inter text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed cursor-pointer disabled:opacity-60";
const headingClass = "font-outfit text-2xl font-semibold text-[#121212]";
const helpClass = "mt-2 font-inter text-sm leading-6 text-[#5F6673]";
const errorClass = "text-red-500 text-xs font-normal";

async function postJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export default function AccountPage() {
  const { update } = useSession();
  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState(false);

  const fetchAccount = useCallback(
    () =>
      fetch("/api/account")
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data: Account) => setAccount(data))
        .catch(() => setLoadError(true)),
    []
  );

  const loadAccount = () => {
    setLoadError(false);
    fetchAccount();
  };

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  if (!account) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-[#F8F9FD] px-6 pt-8 sm:pt-12 lg:pt-[72px] pb-6 sm:pb-8 sm:px-10">
          {loadError ? (
            <div className="mx-auto max-w-[800px] text-center font-inter text-sm text-[#5F6673]">
              <p>We couldn&apos;t load your account.</p>
              <button onClick={loadAccount} className="mt-3 font-semibold text-[#0171F9] hover:underline cursor-pointer">
                Try again
              </button>
            </div>
          ) : (
            <PageLoader message="Loading your account..." />
          )}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F9FD] px-6 pt-8 sm:pt-12 lg:pt-[72px] pb-6 sm:pb-8 sm:px-10">
        <section className="mx-auto max-w-[800px]">
          <div className="mb-10">
            <span className="mb-3 inline-flex rounded-lg bg-[#001B3B] px-[23px] py-1.5 font-inter text-sm leading-4 text-[#F8FAFF]">My Account</span>
            <h1 className="font-outfit text-4xl font-semibold leading-tight text-[#121212] sm:text-5xl">Account settings</h1>
            <p className="mt-4 font-inter text-base leading-7 text-[#5F6673]">Manage your name, email address and password. Changing your name here doesn&apos;t change reports you&apos;ve already submitted - each report keeps the choice you made when you submitted it: Anonymous, or the name you entered for that report.</p>
          </div>

          <div className="flex flex-col gap-8">
            <NameSection
              account={account}
              onSaved={async (full_name) => {
                setAccount((prev) => (prev ? { ...prev, full_name } : prev));
                await update();
              }}
            />
            <EmailSection
              account={account}
              onRequested={(pendingEmail) => setAccount((prev) => (prev ? { ...prev, pendingEmail } : prev))}
            />
            <PasswordSection account={account} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function NameSection({ account, onSaved }: { account: Account; onSaved: (name: string) => Promise<void> }) {
  const [name, setName] = useState(account.full_name);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const unchanged = name.trim() === account.full_name.trim();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const nameError = validateDisplayName(name);
    setError(nameError ?? "");
    if (nameError) return;

    setSaving(true);
    try {
      const { ok, data } = await postJson("/api/account", "PATCH", { full_name: name });
      if (!ok) {
        toast.error(data.error || "Unable to update your name.");
        return;
      }
      setName(data.full_name);
      await onSaved(data.full_name);
      toast.success(data.message || "Name updated successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cardClass} noValidate>
      <h2 className={headingClass}>Name</h2>
      <p className={helpClass}>The name shown on your account.</p>
      <label className={`${labelClass} mt-6`}>
        Display Name
        <input
          value={name}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className={inputClass}
          placeholder="Enter your name"
          autoComplete="name"
        />
        {error && <span className={errorClass}>{error}</span>}
      </label>
      <button type="submit" disabled={saving || unchanged} className={buttonClass}>
        {saving ? "Saving..." : "Save Name"}
      </button>
    </form>
  );
}

function EmailSection({
  account,
  onRequested,
}: {
  account: Account;
  onRequested: (pending: Account["pendingEmail"]) => void;
}) {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [sending, setSending] = useState(false);
  const [approvalSentTo, setApprovalSentTo] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const nextErrors: typeof errors = {};
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    else if (email.trim().toLowerCase() === account.email.toLowerCase()) nextErrors.email = "This is already your email address";
    if (account.hasPassword && !currentPassword) nextErrors.password = "Current password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    try {
      const { ok, data } = await postJson(
        "/api/account/email",
        "POST",
        account.hasPassword ? { email, currentPassword } : { email }
      );
      if (!ok) {
        if (data.error === "Current password is incorrect") {
          setErrors({ password: data.error });
          setCurrentPassword("");
        } else {
          toast.error(data.error || "Unable to request an email change.");
        }
        return;
      }
      setEmail("");
      setCurrentPassword("");
      if (data.approvalSentTo) {
        setApprovalSentTo(data.approvalSentTo);
        toast.success(data.message || "Approval link sent");
        return;
      }
      setApprovalSentTo("");
      onRequested(data.pendingEmail);
      toast.success(data.message || "Confirmation link sent");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cardClass} noValidate>
      <h2 className={headingClass}>Email</h2>
      <p className={helpClass}>
        Current email: <span className="font-semibold text-[#212121] break-all">{account.email}</span>
      </p>

      {account.pendingEmail && (
        <div className="mt-4 rounded-[6px] border border-[#BFDCFD] bg-[#EFF6FF] px-4 py-3 font-inter text-sm leading-6 text-[#0171F9]">
          A change to <strong className="break-all">{account.pendingEmail.email}</strong> is waiting for confirmation. Open the link we sent to that address while signed in. Your current email stays active until then.
        </div>
      )}

      {approvalSentTo && (
        <div className="mt-4 rounded-[6px] border border-[#BFDCFD] bg-[#EFF6FF] px-4 py-3 font-inter text-sm leading-6 text-[#0171F9]">
          We sent an approval link to <strong className="break-all">{approvalSentTo}</strong>. Open it while signed in to approve the change - we&apos;ll then send a confirmation link to the new address.
        </div>
      )}

      <label className={`${labelClass} mt-6`}>
        New Email Address
        <input
          type="email"
          value={email}
          maxLength={EMAIL_MAX_LENGTH}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          className={inputClass}
          placeholder="Enter your new email address"
          autoComplete="email"
        />
        {errors.email && <span className={errorClass}>{errors.email}</span>}
      </label>
      {account.hasPassword && (
        <label className={`${labelClass} mt-6`}>
          Current Password
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            className={inputClass}
            placeholder="Enter your current password"
            autoComplete="current-password"
          />
          {errors.password && <span className={errorClass}>{errors.password}</span>}
        </label>
      )}
      <p className={helpClass}>
        {account.hasPassword
          ? "For your security, enter your current password. We'll send a confirmation link to the new address. The link expires in 1 hour."
          : "Your account doesn't have a password, so for your security we'll first email an approval link to your current address. After you approve, we'll send a confirmation link to the new address. Each link expires in 1 hour."}
      </p>
      <button
        type="submit"
        disabled={sending || !email.trim() || (account.hasPassword && !currentPassword)}
        className={buttonClass}
      >
        {sending ? "Sending..." : account.hasPassword ? "Send Confirmation Link" : "Send Approval Link"}
      </button>
    </form>
  );
}

function PasswordSection({ account }: { account: Account }) {
  return account.hasPassword ? <ChangePasswordForm /> : <SetPasswordPanel email={account.email} />;
}

function ChangePasswordForm() {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const setField = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors: typeof errors = {};
    if (!values.current) nextErrors.current = "Current password is required";
    const passwordError = validatePassword(values.next);
    if (passwordError) nextErrors.next = passwordError;
    if (!values.confirm) nextErrors.confirm = "Confirm password is required";
    else if (values.confirm !== values.next) nextErrors.confirm = "Confirm password should match with password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const { ok, data } = await postJson("/api/account/password", "POST", {
        currentPassword: values.current,
        newPassword: values.next,
      });
      if (!ok) {
        toast.error(data.error || "Unable to change your password.");
        return;
      }
      setValues({ current: "", next: "", confirm: "" });
      toast.success(data.message || "Password changed successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const type = showPassword ? "text" : "password";

  return (
    <form onSubmit={handleSubmit} className={cardClass} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={headingClass}>Change Password</h2>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="font-inter text-[13px] font-semibold text-[#0171F9] hover:underline cursor-pointer"
        >
          {showPassword ? "Hide passwords" : "Show passwords"}
        </button>
      </div>
      <p className={helpClass}>
        8-16 characters with no spaces, including an uppercase letter, a lowercase letter, a number and a special character.
      </p>
      <div className="mt-6 grid gap-6">
        <label className={labelClass}>
          Current Password
          <input type={type} value={values.current} onChange={(e) => setField("current", e.target.value)} className={inputClass} placeholder="Enter current password" autoComplete="current-password" />
          {errors.current && <span className={errorClass}>{errors.current}</span>}
        </label>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className={labelClass}>
            New Password
            <input type={type} value={values.next} onChange={(e) => setField("next", e.target.value)} className={inputClass} placeholder="Enter new password" autoComplete="new-password" />
            {errors.next && <span className={errorClass}>{errors.next}</span>}
          </label>
          <label className={labelClass}>
            Confirm New Password
            <input type={type} value={values.confirm} onChange={(e) => setField("confirm", e.target.value)} className={inputClass} placeholder="Re-enter new password" autoComplete="new-password" />
            {errors.confirm && <span className={errorClass}>{errors.confirm}</span>}
          </label>
        </div>
      </div>
      <button type="submit" disabled={saving} className={buttonClass}>
        {saving ? "Saving..." : "Change Password"}
      </button>
    </form>
  );
}

function SetPasswordPanel({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const { ok, data } = await postJson("/api/account/password/set-link", "POST");
      if (!ok) {
        toast.error(data.error || "Unable to send the link.");
        return;
      }
      setSent(true);
      toast.success(data.message || "Link sent");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cardClass}>
      <h2 className={headingClass}>Set Password</h2>
      <p className={helpClass}>
        Your account doesn&apos;t have a password yet - you sign in with Google or Facebook. You can add a password so you can also sign in with your email address. For your security we&apos;ll email a link to{" "}
        <span className="font-semibold text-[#212121] break-all">{email}</span> where you can choose it. Google/Facebook sign-in will keep working.
      </p>
      {sent && (
        <p className="mt-4 rounded-[6px] border border-[#BFDCFD] bg-[#EFF6FF] px-4 py-3 font-inter text-sm leading-6 text-[#0171F9]">
          Check your inbox. The link expires in 1 hour.
        </p>
      )}
      <button type="button" onClick={handleSend} disabled={sending} className={buttonClass}>
        {sending ? "Sending..." : sent ? "Send Link Again" : "Send Set-Password Link"}
      </button>
    </div>
  );
}
