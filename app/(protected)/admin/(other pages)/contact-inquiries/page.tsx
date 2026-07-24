"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type InquiryStatus = "new" | "read" | "resolved";

type Inquiry = {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
};

const statusLabels: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  resolved: "Resolved",
};

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const response = await fetch("/api/admin/contact-inquiries");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load inquiries.");
        setInquiries(result.inquiries || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load inquiries.");
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, []);

  const updateStatus = async (id: number, status: InquiryStatus) => {
    try {
      const response = await fetch("/api/admin/contact-inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update inquiry.");
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? { ...inquiry, status } : inquiry));
      setSelectedInquiry((current) => current?.id === id ? { ...current, status } : current);
      toast.success("Inquiry status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update inquiry.");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-outfit text-2xl font-semibold leading-8 text-[#121212] sm:text-3xl">Contact Inquiries</h1>
          <p className="mt-1 font-inter text-sm text-[#6B7280]">Review and manage messages from website visitors.</p>
        </div>
        <span className="w-fit rounded-full bg-[#EDF5FF] px-3 py-1 font-inter text-sm font-medium text-[#0171F9]">{inquiries.filter((inquiry) => inquiry.status === "new").length} new</span>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl bg-white"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0171F9]" /></div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center"><p className="font-inter text-[#6B7280]">No contact inquiries yet.</p></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-black/10 bg-[#FAFCFE]"><tr><th className="px-5 py-4 font-inter text-xs font-semibold uppercase tracking-wide text-[#737786]">Visitor</th><th className="px-5 py-4 font-inter text-xs font-semibold uppercase tracking-wide text-[#737786]">Subject</th><th className="px-5 py-4 font-inter text-xs font-semibold uppercase tracking-wide text-[#737786]">Received</th><th className="px-5 py-4 font-inter text-xs font-semibold uppercase tracking-wide text-[#737786]">Status</th><th className="px-5 py-4" /></tr></thead>
              <tbody>{inquiries.map((inquiry) => <tr key={inquiry.id} className="border-b border-black/5 last:border-0"><td className="px-5 py-4"><p className="font-inter text-sm font-semibold text-[#121212]">{inquiry.full_name}</p><p className="font-inter text-xs text-[#737786]">{inquiry.email}</p></td><td className="max-w-[260px] truncate px-5 py-4 font-inter text-sm text-[#30343B]">{inquiry.subject}</td><td className="px-5 py-4 font-inter text-sm text-[#737786]">{new Date(inquiry.created_at).toLocaleDateString()}</td><td className="px-5 py-4"><select aria-label={`Status for ${inquiry.subject}`} value={inquiry.status} onChange={(event) => updateStatus(inquiry.id, event.target.value as InquiryStatus)} className="rounded-lg border border-[#D9DEE7] bg-white px-3 py-2 font-inter text-sm text-[#30343B] outline-none focus:border-[#0171F9]"><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option></select></td><td className="px-5 py-4 text-right"><button onClick={() => setSelectedInquiry(inquiry)} className="font-inter text-sm font-semibold text-[#0171F9] hover:text-blue-700 cursor-pointer">View</button></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {selectedInquiry && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedInquiry(null)}>
        <section role="dialog" aria-modal="true" aria-labelledby="inquiry-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4"><div>
            <p className="font-inter text-xs font-semibold uppercase tracking-wide text-[#0171F9]">{statusLabels[selectedInquiry.status]}</p>
            <h2 id="inquiry-title" className="mt-1 font-outfit text-2xl font-semibold text-[#121212]">{selectedInquiry.subject}</h2>
          </div>
            <button aria-label="Close inquiry" onClick={() => setSelectedInquiry(null)} className="text-2xl leading-none text-[#737786] cursor-pointer">&times;</button>
          </div>
          <div className="mt-6 grid gap-1 font-inter text-sm text-[#5F6673]"><span className="font-semibold text-[#212121]">{selectedInquiry.full_name}</span><a href={`mailto:${selectedInquiry.email}`} className="text-[#0171F9]">{selectedInquiry.email}</a>
          </div>
          <p className="mt-6 whitespace-pre-wrap font-inter text-base leading-7 text-[#30343B]">{selectedInquiry.message}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => updateStatus(selectedInquiry.id, "read")} className="rounded-lg border border-[#D9DEE7] px-4 py-2 font-inter text-sm font-semibold text-[#30343B] cursor-pointer">Mark Read</button>
            <button onClick={() => updateStatus(selectedInquiry.id, "resolved")} className="rounded-lg bg-[#0171F9] px-4 py-2 font-inter text-sm font-semibold text-white cursor-pointer">Mark Resolved</button>
          </div>
        </section>
      </div>}
    </main>
  );
}
