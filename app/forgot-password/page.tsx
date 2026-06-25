"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoader(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }
      console.log(data.resetUrl)
      setSent(true);
      toast.success(data.message);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F4F7] flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-3 mb-6">
        <Link href="/">
          <Image src="/logo.svg" height={150} width={150} alt="Logo" />
        </Link>
        <p className="font-inter text-sm text-[#737786] text-center">
          Your identity stays private - always.
        </p>
      </div>

      <div className="w-full max-w-[512px] bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-9 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-[Outfit] text-2xl font-bold text-[#212121]">
              Forgot password
            </h1>
            <p className="font-inter text-sm text-[#6B7280] mt-2">
              {sent
                ? "Check your inbox for a reset link. It expires in 1 hour."
                : "Enter your email and we will send you a reset link."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-[Outfit] text-base font-medium text-[#212121]"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-[15px] rounded-lg bg-[#F3F4F5] font-inter text-sm font-medium text-[#6B7280] placeholder-[#6B7280]/64 outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loader}
                className="cursor-pointer w-full py-3 rounded-lg bg-[#0171F9] text-white font-inter text-base font-semibold leading-6 text-center hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {loader ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="w-full py-3 rounded-lg bg-[#0171F9] text-white font-inter text-base font-semibold leading-6 text-center hover:bg-blue-600 transition-colors block"
            >
              Back to login
            </Link>
          )}

          {!sent && (
            <div className="flex items-center justify-center">
              <Link
                href="/login"
                className="font-inter text-[13px] font-semibold text-[#0171F9] hover:underline"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
