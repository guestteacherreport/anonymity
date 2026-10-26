"use client";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Opening the emailed link only renders this page. The token is consumed by
// an explicit POST when the user clicks Confirm/Approve, so link scanners and
// email previews that fetch the URL cannot use it up.
//
// Two links land here:
// - ?token=   sent to the NEW address; confirms the change.
// - ?approve= sent to the CURRENT address of a passwordless account; approves
//             the request, after which the ?token= link goes to the new one.
function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const approvalToken = token ? "" : searchParams.get("approve") || "";
  const isApproval = !!approvalToken;
  const { update } = useSession();
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">(token || approvalToken ? "idle" : "error");
  const [message, setMessage] = useState(token || approvalToken ? "" : "This confirmation link is invalid.");

  const handleConfirm = async () => {
    if (state === "submitting") return;
    setState("submitting");
    try {
      const res = await fetch(isApproval ? "/api/account/email" : "/api/account/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isApproval ? { approvalToken } : { token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error || (isApproval ? "Unable to approve your email change." : "Unable to confirm your email change."));
        return;
      }
      if (isApproval) {
        setState("done");
        setMessage(data.message || "Approved. Check your new inbox for the confirmation link.");
        return;
      }
      await update();
      setState("done");
      setMessage(
        data.hasPassword === true
          ? `Your email address is now ${data.email}. Use it the next time you sign in with your email and password.`
          : data.hasPassword === false
            ? `Your email address is now ${data.email}. Keep signing in with Google or Facebook as before - account emails will now go to this address.`
            : `Your email address is now ${data.email}. Account emails will now go to this address.`
      );
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl border border-[rgba(1,113,249,0.10)] bg-white p-6 shadow-[0_2px_9.9px_0_rgba(0,0,0,0.06)] sm:p-10">
      <h1 className="font-outfit text-2xl font-semibold text-[#121212] sm:text-3xl">
        {isApproval ? "Approve Email Change" : "Confirm Email Change"}
      </h1>

      {(state === "idle" || state === "submitting") && (
        <>
          <p className="mt-3 font-inter text-sm leading-6 text-[#5F6673]">
            {isApproval
              ? "Approve changing the email address on your account. We'll then send a confirmation link to the new address."
              : "Confirm that you want to use this address as the email for your account."}
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={state === "submitting"}
            className="mt-6 rounded-xl bg-[#0171F9] px-7 py-3.5 font-inter text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed cursor-pointer disabled:opacity-60"
          >
            {isApproval
              ? state === "submitting" ? "Approving..." : "Approve Email Change"
              : state === "submitting" ? "Confirming..." : "Confirm Email Change"}
          </button>
        </>
      )}

      {state === "done" && <p className="mt-3 font-inter text-sm leading-6 text-[#16a34a] break-words">{message}</p>}
      {state === "error" && <p className="mt-3 font-inter text-sm leading-6 text-red-600">{message}</p>}

      {(state === "done" || state === "error") && (
        <Link href="/account" className="mt-6 inline-block font-inter text-[13px] font-semibold text-[#0171F9] hover:underline">
          Go to My Account
        </Link>
      )}
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F9FD] px-6 pt-8 sm:pt-12 lg:pt-[72px] pb-6 sm:pb-8 sm:px-10">
        <section className="mx-auto max-w-[640px]">
          <Suspense fallback={null}>
            <ConfirmEmailContent />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
