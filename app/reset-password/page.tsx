"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { validatePassword } from "@/lib/password";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirm_password?: string;
  }>({});
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirm_password = "Confirm password is required";
    } else if (confirmPassword !== password) {
      nextErrors.confirm_password =
        "Confirm password should match with password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!token) {
      toast.error("Reset link is invalid or expired.");
      return;
    }

    setLoader(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Unable to reset password.");
        return;
      }

      toast.success(data.message || "Password updated successfully.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center flex flex-col gap-4">
        <p className="font-inter text-sm text-[#6B7280]">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="font-inter text-[13px] font-semibold text-[#0171F9] hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="font-[Outfit] text-base font-medium text-[#212121]"
        >
          New Password
        </label>
        <div className="flex items-center w-full px-4 py-[15px] rounded-lg bg-[#F3F4F5] focus-within:ring-2 focus-within:ring-[#0171F9]/30 transition">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            placeholder="Enter new password"
            className="flex-1 bg-transparent font-inter text-sm font-medium text-[#6B7280] placeholder-[#6B7280]/64 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
            aria-label="Toggle password visibility"
          >
            <EyeIcon />
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirm_password"
          className="font-[Outfit] text-base font-medium text-[#212121]"
        >
          Confirm Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="confirm_password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors((prev) => ({ ...prev, confirm_password: "" }));
          }}
          placeholder="Confirm new password"
          className="w-full px-4 py-[15px] rounded-lg bg-[#F3F4F5] font-inter text-sm font-medium text-[#6B7280] placeholder-[#6B7280]/64 outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition"
        />
        {errors.confirm_password && (
          <p className="text-red-500 text-xs">{errors.confirm_password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loader}
        className="cursor-pointer w-full py-3 rounded-lg bg-[#0171F9] text-white font-inter text-base font-semibold leading-6 text-center hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-70"
      >
        {loader ? "Updating..." : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F3F4F7] flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-3 mb-6">
        <Link href="/">
          <Image src="/logo.svg" height={150} width={150} alt="Logo" />
        </Link>
      </div>

      <div className="w-full max-w-[512px] bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-9 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-[Outfit] text-2xl font-bold text-[#212121]">
              Reset password
            </h1>
            <p className="font-inter text-sm text-[#6B7280] mt-2">
              Choose a new password for your account.
            </p>
          </div>

          <Suspense
            fallback={
              <p className="font-inter text-sm text-center text-[#6B7280]">
                Loading...
              </p>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="font-inter text-[13px] font-semibold text-[#0171F9] hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.4">
        <path
          d="M15.4569 7.7975C15.435 7.74813 14.9056 6.57375 13.7287 5.39687C12.1606 3.82875 10.18 3 7.99999 3C5.81999 3 3.83937 3.82875 2.27124 5.39687C1.09437 6.57375 0.562494 7.75 0.543119 7.7975C0.51469 7.86144 0.5 7.93064 0.5 8.00062C0.5 8.0706 0.51469 8.1398 0.543119 8.20375C0.564994 8.25312 1.09437 9.42688 2.27124 10.6038C3.83937 12.1713 5.81999 13 7.99999 13C10.18 13 12.1606 12.1713 13.7287 10.6038C14.9056 9.42688 15.435 8.25312 15.4569 8.20375C15.4853 8.1398 15.5 8.0706 15.5 8.00062C15.5 7.93064 15.4853 7.86144 15.4569 7.7975ZM7.99999 12C6.07624 12 4.39562 11.3006 3.00437 9.92188C2.43354 9.35417 1.94788 8.70683 1.56249 8C1.94774 7.29307 2.43341 6.64572 3.00437 6.07812C4.39562 4.69938 6.07624 4 7.99999 4C9.92374 4 11.6044 4.69938 12.9956 6.07812C13.5676 6.64562 14.0543 7.29297 14.4406 8C13.99 8.84125 12.0269 12 7.99999 12ZM7.99999 5C7.40665 5 6.82663 5.17595 6.33328 5.50559C5.83994 5.83524 5.45542 6.30377 5.22836 6.85195C5.00129 7.40013 4.94188 8.00333 5.05764 8.58527C5.17339 9.16721 5.45912 9.70176 5.87867 10.1213C6.29823 10.5409 6.83278 10.8266 7.41472 10.9424C7.99667 11.0581 8.59987 10.9987 9.14804 10.7716C9.69622 10.5446 10.1648 10.1601 10.4944 9.66671C10.824 9.17336 11 8.59334 11 8C10.9992 7.2046 10.6828 6.44202 10.1204 5.87959C9.55797 5.31716 8.79539 5.00083 7.99999 5ZM7.99999 10C7.60443 10 7.21775 9.8827 6.88885 9.66294C6.55996 9.44318 6.30361 9.13082 6.15224 8.76537C6.00086 8.39991 5.96125 7.99778 6.03842 7.60982C6.11559 7.22186 6.30608 6.86549 6.58578 6.58579C6.86549 6.30608 7.22185 6.1156 7.60981 6.03843C7.99778 5.96126 8.39991 6.00087 8.76536 6.15224C9.13081 6.30362 9.44317 6.55996 9.66293 6.88886C9.8827 7.21776 9.99999 7.60444 9.99999 8C9.99999 8.53043 9.78928 9.03914 9.41421 9.41421C9.03913 9.78929 8.53043 10 7.99999 10Z"
          fill="#1E1E1E"
        />
      </g>
    </svg>
  );
}
