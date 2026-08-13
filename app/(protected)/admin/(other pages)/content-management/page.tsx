"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { contentPageMetadata, type ContentPageSlug } from "@/lib/content-page-schema";

type ContentPage = {
  slug: ContentPageSlug;
  title: string;
  path: string;
  description: string;
  updatedAt: string | null;
  publishedAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ContentManagementPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPages() {
      try {
        const response = await fetch("/api/admin/content-pages");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load content pages.");
        setPages(data.pages);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load content pages.");
        setPages(Object.entries(contentPageMetadata).map(([slug, page]) => ({
          ...page,
          slug: slug as ContentPageSlug,
          updatedAt: null,
          publishedAt: null,
        })));
      } finally {
        setLoading(false);
      }
    }

    loadPages();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-outfit text-2xl font-semibold text-[#121212] sm:text-3xl">Content Management</h1>
        <p className="mt-2 font-outfit text-base text-[#414141] sm:text-[18px]">Manage the content shown across the public website.</p>
      </div>

      <section className="overflow-hidden rounded-xl bg-white">
        <div className="border-b border-[#E7E8EC] px-5 py-5 sm:px-6">
          <h2 className="font-outfit text-xl font-semibold text-[#191C1D]">Website Pages</h2>
          <p className="mt-1 font-inter text-sm text-[#6B727F]">Save edits as a draft, then publish when the page is ready for visitors.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-14 font-inter text-sm text-[#6B727F]">Loading pages...</div>
        ) : (
          <div className="divide-y divide-[#E7E8EC]">
            {pages.map((page) => (
              <div key={page.slug} className="flex flex-col gap-5 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-outfit text-lg font-semibold text-[#191C1D]">{page.title}</h3>
                    <span className="rounded-md bg-[#EDF5FF] px-2 py-1 font-inter text-xs font-medium text-[#0171F9]">{page.path}</span>
                  </div>
                  <p className="mt-2 max-w-2xl font-inter text-sm leading-6 text-[#60636F]">{page.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-inter text-xs text-[#737786]">
                    <span>Last saved: {formatDate(page.updatedAt)}</span>
                    <span>Published: {formatDate(page.publishedAt)}</span>
                  </div>
                </div>
                <Link href={`/admin/content-management/${page.slug}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0171F9] px-5 py-3 font-inter text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10.3333 2.00002L14 5.66669L6.33333 13.3334H2.66667V9.66669L10.3333 2.00002Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
