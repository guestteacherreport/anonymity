"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  contentPageDefaults,
  contentPageMetadata,
  isContentPageSlug,
  mergeContentPage,
  type ContentPageContent,
  type ContentPageSlug,
} from "@/lib/content-page-schema";

type ContentPageResponse = {
  slug: ContentPageSlug;
  content: ContentPageContent;
  publishedContent: ContentPageContent;
  updatedAt: string | null;
  publishedAt: string | null;
};

type EditorField = {
  key: string;
  label: string;
  kind: "text" | "url" | "rich";
  hint?: string;
};

const editorFields: Record<ContentPageSlug, EditorField[]> = {
  home: [
    { key: "heroEyebrow", label: "Hero label", kind: "text" },
    { key: "heroHeading", label: "Hero heading", kind: "text" },
    { key: "primaryButtonLabel", label: "Primary button label", kind: "text" },
    { key: "primaryButtonHref", label: "Primary button link", kind: "url", hint: "Use a site path such as /submit-report." },
    { key: "secondaryButtonLabel", label: "Secondary button label", kind: "text" },
    { key: "secondaryButtonHref", label: "Secondary button link", kind: "url", hint: "Use a site path such as /browse-school." },
    { key: "whyHeading", label: "Why section heading", kind: "text" },
    { key: "whyStayAnonymousHeading", label: "Stay Anonymous heading", kind: "text" },
    { key: "whyStayAnonymousDescription", label: "Stay Anonymous description", kind: "rich" },
    { key: "whyStructuredReportsHeading", label: "Structured Reports heading", kind: "text" },
    { key: "whyStructuredReportsDescription", label: "Structured Reports description", kind: "rich" },
    { key: "whyBetterDecisionsHeading", label: "Better Decisions heading", kind: "text" },
    { key: "whyBetterDecisionsDescription", label: "Better Decisions description", kind: "rich" },
    { key: "whySmartSearchHeading", label: "Smart Search heading", kind: "text" },
    { key: "whySmartSearchDescription", label: "Smart Search description", kind: "rich" },
    { key: "whyAiInsightsHeading", label: "AI Insights heading", kind: "text" },
    { key: "whyAiInsightsDescription", label: "AI Insights description", kind: "rich" },
    { key: "understandHeading", label: "Classroom section heading", kind: "text" },
    { key: "understandDescription", label: "Classroom section description", kind: "rich" },
    { key: "opportunitiesHeading", label: "Opportunities section heading", kind: "text" },
    { key: "opportunitiesDescription", label: "Opportunities section description", kind: "rich" },
    { key: "stepsHeading", label: "Steps section heading", kind: "text" },
    { key: "stepsOneHeading", label: "Step one heading", kind: "text" },
    { key: "stepsOneDescription", label: "Step one description", kind: "rich" },
    { key: "stepsTwoHeading", label: "Step two heading", kind: "text" },
    { key: "stepsTwoDescription", label: "Step two description", kind: "rich" },
    { key: "stepsThreeHeading", label: "Step three heading", kind: "text" },
    { key: "stepsThreeDescription", label: "Step three description", kind: "rich" },
    { key: "featureHeading", label: "Reports section heading", kind: "text" },
    { key: "featureDescription", label: "Reports section description", kind: "rich" },
    { key: "reportsLabel", label: "Reports stat label", kind: "text" },
    { key: "schoolsLabel", label: "Schools stat label", kind: "text" },
    { key: "verifiedUserLabel", label: "Verified user label", kind: "text" },
  ],
  about: [
    { key: "heroEyebrow", label: "Hero label", kind: "text" },
    { key: "heroHeading", label: "Hero heading", kind: "text" },
    { key: "heroHeadingAccent", label: "Hero heading accent", kind: "text" },
    { key: "heroDescription", label: "Hero description", kind: "rich" },
    { key: "primaryButtonLabel", label: "Primary button label", kind: "text" },
    { key: "primaryButtonHref", label: "Primary button link", kind: "url", hint: "Use a site path such as /browse-school." },
    { key: "secondaryButtonLabel", label: "Secondary button label", kind: "text" },
    { key: "secondaryButtonHref", label: "Secondary button link", kind: "url", hint: "Use a site path such as /submit-report." },
    { key: "howItWorksEyebrow", label: "How it works label", kind: "text" },
    { key: "howItWorksHeading", label: "How it works heading", kind: "text" },
    { key: "howItWorksDescription", label: "How it works description", kind: "rich" },
    { key: "howItWorksOneHeading", label: "Step one heading", kind: "text" },
    { key: "howItWorksOneDescription", label: "Step one description", kind: "rich" },
    { key: "howItWorksTwoHeading", label: "Step two heading", kind: "text" },
    { key: "howItWorksTwoDescription", label: "Step two description", kind: "rich" },
    { key: "howItWorksThreeHeading", label: "Step three heading", kind: "text" },
    { key: "howItWorksThreeDescription", label: "Step three description", kind: "rich" },
    { key: "problemEyebrow", label: "Problem label", kind: "text" },
    { key: "problemHeading", label: "Problem heading", kind: "text" },
    { key: "problemContent", label: "Problem content", kind: "rich" },
    { key: "schoolsReviewedNumber", label: "Schools reviewed number", kind: "text" },
    { key: "schoolsReviewedLabel", label: "Schools reviewed label", kind: "text" },
    { key: "reportsSubmittedNumber", label: "Reports submitted number", kind: "text" },
    { key: "reportsSubmittedLabel", label: "Reports submitted label", kind: "text" },
    { key: "guestTeachersNumber", label: "Guest teachers number", kind: "text" },
    { key: "guestTeachersLabel", label: "Guest teachers label", kind: "text" },
    { key: "statesCoveredNumber", label: "States covered number", kind: "text" },
    { key: "statesCoveredLabel", label: "States covered label", kind: "text" },
    { key: "whyEyebrow", label: "Our why label", kind: "text" },
    { key: "whyHeading", label: "Our why heading", kind: "text" },
    { key: "whyDescription", label: "Our why description", kind: "rich" },
    { key: "whyAnonymousHeading", label: "Anonymous benefit heading", kind: "text" },
    { key: "whyAnonymousDescription", label: "Anonymous benefit description", kind: "rich" },
    { key: "whyPeerSourcedHeading", label: "Peer-sourced benefit heading", kind: "text" },
    { key: "whyPeerSourcedDescription", label: "Peer-sourced benefit description", kind: "rich" },
    { key: "whyCommunityHeading", label: "Community benefit heading", kind: "text" },
    { key: "whyCommunityDescription", label: "Community benefit description", kind: "rich" },
    { key: "whyInsightsHeading", label: "Insights benefit heading", kind: "text" },
    { key: "whyInsightsDescription", label: "Insights benefit description", kind: "rich" },
    { key: "guidelinesEyebrow", label: "Guidelines label", kind: "text" },
    { key: "guidelinesHeading", label: "Guidelines heading", kind: "text" },
    { key: "guidelinesDescription", label: "Guidelines description", kind: "rich" },
    ...["One", "Two", "Three", "Four", "Five", "Six"].flatMap((number) => [
      { key: `guidelines${number}Heading`, label: `Guideline ${number.toLowerCase()} heading`, kind: "text" as const },
      { key: `guidelines${number}Description`, label: `Guideline ${number.toLowerCase()} description`, kind: "rich" as const },
    ]),
    { key: "overviewEyebrow", label: "About label", kind: "text" },
    { key: "overviewQuote", label: "About quote", kind: "rich" },
    { key: "overviewAttribution", label: "Quote attribution", kind: "text" },
    { key: "overviewHeading", label: "About section heading", kind: "text" },
    { key: "overviewContent", label: "About section content", kind: "rich" },
    { key: "schoolsEyebrow", label: "Schools label", kind: "text" },
    { key: "schoolsHeading", label: "Schools section heading", kind: "text" },
    { key: "schoolsDescription", label: "Schools section description", kind: "rich" },
    ...["One", "Two", "Three"].flatMap((number) => [
      { key: `schools${number}Heading`, label: `Schools benefit ${number.toLowerCase()} heading`, kind: "text" as const },
      { key: `schools${number}Description`, label: `Schools benefit ${number.toLowerCase()} description`, kind: "rich" as const },
    ]),
    { key: "directionEyebrow", label: "Direction label", kind: "text" },
    { key: "directionHeading", label: "Direction heading", kind: "text" },
    { key: "missionLabel", label: "Mission label", kind: "text" },
    { key: "missionDescription", label: "Mission description", kind: "rich" },
    { key: "visionLabel", label: "Vision label", kind: "text" },
    { key: "visionDescription", label: "Vision description", kind: "rich" },
    { key: "goalLabel", label: "Goal label", kind: "text" },
    { key: "goalDescription", label: "Goal description", kind: "rich" },
  ],
};

function markdownToHtml(value: string) {
  const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((line) => line.startsWith("- "))) {
        return `<ul>${lines.map((line) => `<li>${line.slice(2)}</li>`).join("")}</ul>`;
      }
      return `<p>${lines.join("<br>")}</p>`;
    })
    .join("")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
}

function htmlToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeName === "BR") return "\n";

  const content = Array.from(node.childNodes).map(htmlToMarkdown).join("");
  if (node.nodeName === "STRONG" || node.nodeName === "B") return `**${content}**`;
  if (node.nodeName === "EM" || node.nodeName === "I") return `_${content}_`;
  if (node.nodeName === "LI") return `- ${content}\n`;
  if (node.nodeName === "P" || node.nodeName === "DIV") return `${content}\n\n`;
  return content;
}

function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const renderedValueRef = useRef(value);

  useEffect(() => {
    if (renderedValueRef.current === value || !editorRef.current) return;
    editorRef.current.innerHTML = markdownToHtml(value);
    renderedValueRef.current = value;
  }, [value]);

  function applyCommand(command: "bold" | "italic" | "insertUnorderedList") {
    editorRef.current?.focus();
    document.execCommand(command);
    const nextValue = htmlToMarkdown(editorRef.current || document.createElement("div")).trim();
    renderedValueRef.current = nextValue;
    onChange(nextValue);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#DDE0E7] bg-white focus-within:border-[#0171F9] focus-within:ring-2 focus-within:ring-[#0171F9]/15">
      <div className="flex items-center gap-1 border-b border-[#E7E8EC] bg-[#F8F9FD] p-2">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("bold")} className="rounded px-2 py-1 font-inter text-sm font-bold text-[#353941] hover:bg-white" aria-label="Bold selected text">Bold</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("italic")} className="rounded px-2 py-1 font-inter text-sm italic text-[#353941] hover:bg-white" aria-label="Italicize selected text">Italic</button>
        {/* <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("insertUnorderedList")} className="rounded px-2 py-1 font-inter text-sm text-[#353941] hover:bg-white" aria-label="Add a list item">List</button> */}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          const nextValue = htmlToMarkdown(editorRef.current || document.createElement("div")).trim();
          renderedValueRef.current = nextValue;
          onChange(nextValue);
        }}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
        className="block min-h-[120px] w-full resize-y overflow-auto px-4 py-3 font-inter text-sm leading-6 text-[#191C1D] outline-none"
      />
      <p className="border-t border-[#E7E8EC] px-4 py-2 font-inter text-xs text-[#737786]">Use the toolbar for bold, italic. Separate paragraphs with a blank line.</p>
    </div>
  );
}

export default function ContentEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [content, setContent] = useState<ContentPageContent | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      if (!isContentPageSlug(slug)) {
        router.replace("/admin/content-management");
        return;
      }

      try {
        const response = await fetch("/api/admin/content-pages");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load page content.");
        const page = (data.pages as ContentPageResponse[]).find((item) => item.slug === slug);
        setContent(mergeContentPage(slug, page?.content));
        setPublishedAt(page?.publishedAt ?? null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load page content.");
        setContent(contentPageDefaults[slug]);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router, slug]);

  if (!isContentPageSlug(slug)) return null;
  const page = contentPageMetadata[slug];

  function updateField(key: string, value: string) {
    setContent((current) => current ? { ...current, [key]: value } : current);
  }

  async function submit(mode: "save" | "publish") {
    if (!content) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content-pages", {
        method: mode === "publish" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Unable to ${mode} page content.`);
      setContent(mergeContentPage(slug as ContentPageSlug, data.page.content));
      if (mode === "publish") setPublishedAt(data.page.published_at);
      toast.success(mode === "publish" ? "Changes published to the website." : "Draft saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save page content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/content-management" className="inline-flex items-center gap-2 font-inter text-sm font-medium text-[#0171F9] hover:text-blue-700">
            <span aria-hidden="true">←</span> Content Management
          </Link>
          <h1 className="mt-3 font-outfit text-2xl font-semibold text-[#121212] sm:text-3xl">Edit {page.title}</h1>
          <p className="mt-2 font-inter text-sm text-[#60636F]">Update the public page content and publish when it is ready for visitors.</p>
        </div>
        {publishedAt ? <div className="rounded-lg bg-[#EDF5FF] px-3 py-2 font-inter text-xs font-medium text-[#0171F9]">Published: {publishedAt ? new Date(publishedAt).toLocaleString() : "Not yet"}</div> : ""}
      </div>

      {loading || !content ? (
        <div className="flex items-center justify-center rounded-xl bg-white px-6 py-16 font-inter text-sm text-[#6B727F]">Loading editor...</div>
      ) : (
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-5 sm:p-7">
          <div className="mb-7 rounded-lg bg-[#F8F9FD] px-4 py-3 font-inter text-sm text-[#60636F]">This page will remain unchanged for visitors until you select Publish.</div>
          <div className="flex flex-col gap-6">
            {editorFields[slug].map((field) => (
              <label key={field.key} className="flex flex-col gap-2">
                <span className="font-inter text-sm font-semibold text-[#303030]">{field.label}</span>
                {field.kind === "rich" ? (
                  <RichTextField value={content[field.key]} onChange={(value) => updateField(field.key, value)} />
                ) : (
                  <input type={field.kind === "url" ? "url" : "text"} value={content[field.key]} onChange={(event) => updateField(field.key, event.target.value)} className="w-full rounded-lg border border-[#DDE0E7] px-4 py-3 font-inter text-sm text-[#191C1D] outline-none transition-colors focus:border-[#0171F9] focus:ring-2 focus:ring-[#0171F9]/15" />
                )}
                {field.hint && <span className="font-inter text-xs text-[#737786]">{field.hint}</span>}
              </label>
            ))}
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#E7E8EC] pt-5 sm:flex-row sm:justify-end">
            <button type="button" disabled={saving} onClick={() => submit("save")} className="rounded-lg border border-[#0171F9] px-5 py-3 font-inter text-sm font-semibold text-[#0171F9] transition-colors hover:bg-[#EDF5FF] disabled:cursor-not-allowed disabled:opacity-60">Save Draft</button>
            <button type="button" disabled={saving} onClick={() => submit("publish")} className="rounded-lg bg-[#0171F9] px-5 py-3 font-inter text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save & Publish"}</button>
          </div>
        </div>
      )}
    </main>
  );
}
