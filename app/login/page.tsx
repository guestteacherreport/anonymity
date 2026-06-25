"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { scrollToError } from "@/lib/function";
import toast from "react-hot-toast";
import { ObjectType } from "@/lib/types";



function validateForm(state: ObjectType) {
  const errors: ObjectType = {};

  if (!state.email.trim()) {
    errors.email = "Email is required";
  }

  if (!state.password.trim()) { 
    errors.password = "Password is required";
  }

  return errors;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState<ObjectType>({ email: "", password: "" });
  const [errors, setErrors] = useState<ObjectType>({});
  const [loader, setLoader] = useState<boolean>(false);
  const [ButtonMsg, setButtonMsg] = useState<string>("Login");
  const router = useRouter();

  const handleLogin = async () => {
    const validationErrors = validateForm(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToError(validationErrors);
      return;
    }

    setLoader(true);
    setButtonMsg("Logging in...");

    const res = await signIn("credentials", {
      email: formValues.email,
      password: formValues.password,
      redirect: false,
    });

    if (res?.error) {
      setLoader(false);
      setButtonMsg("Login");
      toast.error(res.error || "Something went wrong! Please try again.");
      return;
    }

    setButtonMsg("Redirecting...");
    router.replace("/auth-redirect");
  };

  return (
    <main className="min-h-screen bg-[#F3F4F7] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo + Tagline */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <Link href={"/"}>
          <Image src="/logo.svg" height={150} width={150} alt="Logo" />
        </Link>
        <p className="font-inter text-sm text-[#737786] text-center">
          Your identity stays private - always.
        </p>
      </div>

      {/* Anonymity Banner */}
      <div className="w-full max-w-[512px] flex items-start gap-3 px-4 py-[17px] rounded-[6px] border border-[#BFDCFD] bg-[#EFF6FF] mb-6">

        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 mt-0.5"
        >
          <path
            d="M15 9.75034C15 13.5003 12.375 15.3753 9.255 16.4628C9.09162 16.5182 8.91415 16.5156 8.7525 16.4553C5.625 15.3753 3 13.5003 3 9.75034V4.50034C3 4.0864 3.33606 3.75034 3.75 3.75034C5.25 3.75034 7.125 2.85034 8.43 1.71034C8.75826 1.42989 9.24174 1.42989 9.57 1.71034C10.8825 2.85784 12.75 3.75034 14.25 3.75034C14.6639 3.75034 15 4.0864 15 4.50034V9.75034"
            stroke="#0171F9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.75 9L8.25 10.5L11.25 7.5"
            stroke="#0171F9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-inter text-sm text-[#0171F9] leading-[23px]">
          Reports you submit are always{" "}
          <strong className="font-bold">100% anonymous</strong>. Your name is
          never attached.
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-[512px] bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="relative flex border-b border-[#E5E7EB]">
          <div className="flex-1 relative py-[22px] text-center font-inter text-base font-bold text-[#0171F9] tracking-[-0.02em]">
            Log In
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0171F9]" />
          </div>
          <Link
            href="/signup"
            className="flex-1 py-[22px] text-center font-inter text-base font-bold text-[#9CA3AF] tracking-[-0.02em] hover:text-gray-500 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Form */}
        <div className="px-8 pt-7 pb-9 flex flex-col gap-6">
          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="font-[Outfit] text-base font-medium text-[#212121]">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={(e) => {
                const { name, value } = e.target;
                setFormValues((prev) => ({
                  ...prev,
                  [name]: value,
                }));
                setErrors((prev) => ({
                    ...prev,
                    email: "",
                  }));
              }}
              value={formValues?.email}
              placeholder="Enter Email Address"
              className="w-full px-4 py-[15px] rounded-lg bg-[#F3F4F5] font-inter text-sm font-medium text-[#6B7280] placeholder-[#6B7280]/64 outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-[Outfit] text-base font-medium text-[#212121]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-inter text-[13px] font-semibold text-[#0171F9] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center w-full px-4 py-[15px] rounded-lg bg-[#F3F4F5] focus-within:ring-2 focus-within:ring-[#0171F9]/30 transition">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                onChange={(e) => {
                  const { name, value } = e.target;
                  setFormValues((prev) => ({
                    ...prev,
                    [name]: value,
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    password: "",
                  }));
                }}
                value={formValues?.password}
                placeholder="Enter Password"
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
          
          {/* Login Button */}
          <button
            type="submit"
            onClick={async () => { handleLogin() }}
            disabled={loader}
            className="cursor-pointer w-full py-3 rounded-lg bg-[#0171F9] text-white font-inter text-base font-semibold leading-6 text-center hover:bg-blue-600 active:bg-blue-700 transition-colors mt-1"
          >
           {loader ? "Processing..." : ButtonMsg} 
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5E7EB]"></div>
            <span className="text-xs text-[#9CA3AF]">Or continue with</span>
            <div className="flex-1 h-px bg-[#E5E7EB]"></div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Google */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/auth-redirect" })}
              className="cursor-pointer w-full py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#212121] font-inter text-base font-semibold leading-6 text-center hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6 10.23c0-.82-.14-1.42-.35-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4" />
                <path d="M13.46 15.13c-.83.63-1.96 1.09-3.46 1.09-2.64 0-4.84-1.74-5.62-4.04H2.18v2.54c1.52 3.02 4.64 5.07 8.28 5.07 2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853" />
                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.49H2.18C1.43 6.93 1 8.43 1 10s.43 3.07 1.18 4.51l2.85-2.22c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05" />
                <path d="M10 3.88c2.11 0 3.54.75 4.37 1.53l3.27-3.27C14.96.87 12.7 0 10 0 6.36 0 3.24 2.04 1.18 5.49l2.85 2.22c.78-2.3 2.98-4.04 5.62-4.04z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => signIn("facebook", { callbackUrl: "/auth-redirect" })}
              className="cursor-pointer w-full py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#212121] font-inter text-base font-semibold leading-6 text-center hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
              </svg>
              Continue with Facebook
            </button>
          </div>
          {/* Sign up link */}
          <div className="flex items-center justify-center gap-2">
            <span className="font-inter text-[13px] font-medium text-[#555968]/70">
              Don&apos;t have an account?
            </span>
            <Link
              href="/signup"
              className="font-inter text-[13px] font-semibold text-[#0171F9] hover:underline"
            >
              Sign up for free
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
