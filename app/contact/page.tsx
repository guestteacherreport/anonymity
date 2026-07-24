"use client";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Turnstile } from "@marsidev/react-turnstile";

const initialForm = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message.");
      }

      setForm(initialForm);
      setCaptchaToken("");
      toast.success("Your message has been sent. Thank you for contacting us.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send your message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F9FD] px-6 pt-8 sm:pt-12 lg:pt-[72px] pb-6 sm:pb-8 sm:px-10">
        <section className="mx-auto max-w-[1100px]">
          <div className="mb-10">
            <span className="mb-3 inline-flex rounded-lg bg-[#001B3B] px-[23px] py-1.5 font-inter text-sm leading-4 text-[#F8FAFF]">Contact Us</span>
            <h1 className="font-outfit text-4xl font-semibold leading-tight text-[#121212] sm:text-5xl">We&apos;re here to help.</h1>
            <p className="mt-4 font-inter text-base leading-7 text-[#5F6673]">Have a question, suggestion, or need support? Send us a message and our team will get back to you.</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-[rgba(1,113,249,0.10)] bg-white p-6 shadow-[0_2px_9.9px_0_rgba(0,0,0,0.06)] sm:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 font-inter text-sm font-medium text-[#212121]">
                Full Name
                <input required maxLength={120} value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className="rounded-xl border border-[#D9DEE7] px-4 py-3 font-normal outline-none transition focus:border-[#0171F9] focus:ring-2 focus:ring-[#0171F9]/15" placeholder="Enter your full name" />
              </label>
              <label className="flex flex-col gap-2 font-inter text-sm font-medium text-[#212121]">
                Email Address
                <input required type="email" maxLength={254} value={form.email} onChange={(event) => updateField("email", event.target.value)} className="rounded-xl border border-[#D9DEE7] px-4 py-3 font-normal outline-none transition focus:border-[#0171F9] focus:ring-2 focus:ring-[#0171F9]/15" placeholder="Enter your email address" />
              </label>
              <label className="flex flex-col gap-2 font-inter text-sm font-medium text-[#212121] sm:col-span-2">
                Subject
                <input required maxLength={180} value={form.subject} onChange={(event) => updateField("subject", event.target.value)} className="rounded-xl border border-[#D9DEE7] px-4 py-3 font-normal outline-none transition focus:border-[#0171F9] focus:ring-2 focus:ring-[#0171F9]/15" placeholder="How can we help?" />
              </label>
              <label className="flex flex-col gap-2 font-inter text-sm font-medium text-[#212121] sm:col-span-2">
                Message
                <textarea required maxLength={5000} rows={7} value={form.message} onChange={(event) => updateField("message", event.target.value)} className="resize-y rounded-xl border border-[#D9DEE7] px-4 py-3 font-normal outline-none transition focus:border-[#0171F9] focus:ring-2 focus:ring-[#0171F9]/15" placeholder="Write your message here" />
              </label>
            </div>

            <div className="mt-7">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) => setCaptchaToken(token)}
              />

              {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <p className="mt-2 font-inter text-sm text-red-600">CAPTCHA is not configured yet.</p>}
            </div>

            <button type="submit" disabled={submitting || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} className="mt-8 rounded-xl bg-[#0171F9] px-7 py-3.5 font-inter text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
