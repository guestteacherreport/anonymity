"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PageLoader from "@/app/components/PageLoader";
import "./calendar.css";
import { CalendarIcon } from "@/lib/icons";
import {
  getRandomEventColors,
  scrollToFirstError,
} from "@/lib/function";
import { ObjectType } from "@/lib/types";

const MAX_ASSIGNMENT_DAYS = 6;

type UpcomingJobsCardProps = {
  events: UpcomingJobItem[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  refershing: boolean;
  eventId: (event: any) => void;
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  school: string;
  school_name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  reminders: number;
  user_id?: any;
}

// A grouped Upcoming Jobs entry - purely a display convenience over several
// individual calendar_event rows that share an assignment and start time.
// It never gets its own id/edit action; `members` are the real underlying
// events (each with its own real id), and only those can be opened for
// editing - see UpcomingJobsCard.
interface UpcomingJobGroup {
  grouped: true;
  groupKey: string;
  title: string;
  school_name: string;
  color: string;
  bgColor: string;
  members: CalendarEvent[];
}

type UpcomingJobItem = CalendarEvent | UpcomingJobGroup;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium font-inter text-[#121212] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ placeholder, value, onChange, type = "text", error, id }: {
  placeholder?: string; value: string; onChange: (v: string) => void; type?: string; error?: string; id?: string
}) {
  return (
    <div>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#F5F6FA] border rounded-lg px-4 py-3 text-sm font-inter text-[#121212] placeholder:text-[#ADADAD] outline-none focus:ring-2 transition-all ${error ? "border-red-500 focus:ring-red-200" : "border-0 focus:ring-[#0171F9]/30"
          }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Used for each day row in the multi-day Add Event form - identical markup
// to the original single Start/End Date fields, just made reusable since
// there can now be up to MAX_ASSIGNMENT_DAYS of them. Owns its own ref so
// clicking anywhere in the field (not just the native icon) opens the
// picker, matching the original behavior.
function DateField({ id, value, onChange, min, error }: {
  id?: string; value: string; onChange: (v: string) => void; min?: string; error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div
        onClick={() => ref.current?.showPicker()}
        className={`flex items-center text-sm gap-[6px] px-4 rounded-lg py-[14px] ${error ? "bg-red-50 border border-red-500" : "bg-[#F3F4F5]"}`}
      >
        {/* flex-1/min-w-0 (rather than w-full + justify-between, which relied
        on overflow-hidden to clip the input) let the icon size itself first,
        so the same px-4 padding on the container lands as equal left/right
        space around the text and icon instead of favoring one side. */}
        <input
          type="date"
          id={id}
          ref={ref}
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none font-inter text-sm text-[#121212] appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
        <div className="flex items-center cursor-pointer">
          <CalendarIcon />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

type SchoolOption = {
  id: number;
  school_name: string;
  city?: string;
  state?: string;
  street_address?: string;
  zipcode?: string;
};

type TeacherOption = {
  id: number;
  name: string;
  school_id: number;
};

// Shared by Add Event and Edit Event (both call this right before saving).
// A teacher picked from the dropdown already carries a real id, trusted
// as-is. A typed name with no id is resolved against the school's existing
// teachers first (reusing the same search endpoint the dropdown itself
// calls) so re-submitting an already-existing name never creates a
// duplicate - only once no match is found does it fall back to creating a
// new teacher record, reusing the existing POST /api/teachers endpoint.
async function resolveOrCreateTeacherId(
  teacherName: string,
  teacherId: number | string | null | undefined,
  schoolId: number | string | null | undefined
): Promise<number | null> {
  const trimmedName = teacherName.trim();
  if (!trimmedName) return null;
  if (teacherId) return Number(teacherId);
  if (!schoolId) return null;

  const searchParams = new URLSearchParams({
    search: trimmedName,
    school_id: String(schoolId),
    limit: "100",
  });
  const searchRes = await fetch(`/api/teachers?${searchParams.toString()}`);
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const matches: TeacherOption[] = Array.isArray(searchData) ? searchData : searchData.teachers || [];
    const exactMatch = matches.find((t) => t.name?.trim().toLowerCase() === trimmedName.toLowerCase());
    if (exactMatch) return exactMatch.id;
  }

  const createRes = await fetch("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmedName, status: "Active", school_id: schoolId }),
  });
  const createData = await createRes.json();
  if (!createRes.ok || !createData.success) {
    throw new Error(createData.message || "Failed to create teacher");
  }
  return createData.teacher?.id ?? null;
}

// Shared by Add Event and Edit Event (rather than each maintaining its own
// copy) so both forms search/paginate schools identically. Self-contained:
// owns its own suggestions/pagination state and flips its dropdown above the
// field (vs. below) based on the viewport, so it works the same whether it's
// rendered inside the Add Event slide-in panel or the Edit Event modal.
function SchoolSearchInput({
  value,
  onChange,
  onSelect,
  label = "School Name",
  required,
  placeholder = "e.g. Lincoln High School",
  error,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (school: SchoolOption) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  id?: string;
}) {
  const [suggestions, setSuggestions] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [placement, setPlacement] = useState<"up" | "down">("down");
  const fieldRef = useRef<HTMLDivElement>(null);
  // Every keystroke fires its own fetch (no debounce, matching the existing
  // pattern), so responses can arrive out of order - e.g. a broad early
  // query like "B" can resolve after the final "Bradley" query and clobber
  // it. Tagging each request and only applying the latest one keeps a fast
  // search term change (or Load More racing a new keystroke) from ever
  // showing results for a stale query.
  const requestIdRef = useRef(0);

  const fetchSchools = useCallback(async (query: string, pageNum = 1, append = false) => {
    if (!query.trim()) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setHasMore(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const params = new URLSearchParams({ search: query, page: String(pageNum) });
      const response = await fetch(`/api/schoolSearch?${params.toString()}`);
      if (requestId !== requestIdRef.current) return;

      if (response.ok) {
        const data = await response.json();
        if (requestId !== requestIdRef.current) return;
        const results: SchoolOption[] = Array.isArray(data) ? data : data.schools || [];
        setSuggestions((prev) => (append ? [...prev, ...results] : results));
        setHasMore(Boolean(data.hasMore));
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      if (!append && requestId === requestIdRef.current) {
        setSuggestions([]);
        setHasMore(false);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    if (!fieldRect) return;
    const menuHeight = 192;
    const spaceBelow = window.innerHeight - fieldRect.bottom;
    const spaceAbove = fieldRect.top;
    setPlacement(spaceBelow < menuHeight && spaceAbove > spaceBelow ? "up" : "down");
  }, [showSuggestions, suggestions.length]);

  return (
    <div className="relative" ref={fieldRef}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <TextInput
        id={id}
        value={value}
        onChange={(v) => {
          onChange(v);
          fetchSchools(v, 1, false);
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        error={error}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className={`${placement === "up" ? "absolute bottom-full mb-1" : "absolute top-full mt-1"} left-0 right-0 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto`}>
          {loading && (
            <div className="px-4 py-3 text-center text-sm text-[#6B7280]">Searching...</div>
          )}
          {!loading && suggestions.map((school) => (
            <button
              key={school.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(school);
                setShowSuggestions(false);
              }}
              className="w-full flex flex-col text-left px-4 py-3 hover:bg-[#F3F4F5] border-b border-[#E0E0E2] last:border-b-0 transition-colors"
            >
              <span className="font-inter text-sm text-[#121212]">{school.school_name}</span>
              {(school.city || school.state) && (
                <span className="font-inter text-xs text-[#6B7280]">
                  {[school.city, school.state].filter(Boolean).join(", ")}
                </span>
              )}
            </button>
          ))}
          {!loading && hasMore && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fetchSchools(value, page + 1, true)}
              disabled={loadingMore}
              className="w-full px-4 py-3 text-center font-inter text-sm text-[#0171F9] hover:bg-[#F3F4F5] disabled:opacity-60 transition-colors"
            >
              {loadingMore ? "Loading more..." : "Load more results"}
            </button>
          )}
        </div>
      )}
      {showSuggestions && !loading && suggestions.length === 0 && value.trim() && (
        <div className={`${placement === "up" ? "absolute bottom-full mb-1" : "absolute top-full mt-1"} left-0 right-0 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-50`}>
          <div className="px-4 py-3 text-center text-sm text-[#6B7280]">No schools found</div>
        </div>
      )}
    </div>
  );
}

// Mirrors SchoolSearchInput - shared by Add Event and Edit Event. Search is
// scoped to whichever school is currently selected (schoolId), matching the
// existing /api/teachers?school_id= requirement.
function TeacherSearchInput({
  value,
  onChange,
  onSelect,
  schoolId,
  label = "Teacher's Full Name",
  placeholder = "e.g. Maria Gonzalez",
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (teacher: TeacherOption) => void;
  schoolId?: number | string | null;
  label?: string;
  placeholder?: string;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [schoolRequiredError, setSchoolRequiredError] = useState("");
  const [placement, setPlacement] = useState<"up" | "down">("down");
  const fieldRef = useRef<HTMLDivElement>(null);
  // See SchoolSearchInput's requestIdRef - same out-of-order-response guard.
  const requestIdRef = useRef(0);

  const fetchTeachers = useCallback(async (query: string, forSchoolId: number | string | null | undefined, pageNum = 1, append = false) => {
    if (!query.trim() || !forSchoolId) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setHasMore(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const params = new URLSearchParams({ search: query, school_id: String(forSchoolId), page: String(pageNum) });
      const response = await fetch(`/api/teachers?${params.toString()}`);
      if (requestId !== requestIdRef.current) return;

      if (response.ok) {
        const data = await response.json();
        if (requestId !== requestIdRef.current) return;
        const results: TeacherOption[] = Array.isArray(data) ? data : data.teachers || [];
        setSuggestions((prev) => (append ? [...prev, ...results] : results));
        setHasMore(Boolean(data.hasMore));
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      if (!append && requestId === requestIdRef.current) {
        setSuggestions([]);
        setHasMore(false);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    if (!fieldRect) return;
    const menuHeight = 192;
    const spaceBelow = window.innerHeight - fieldRect.bottom;
    const spaceAbove = fieldRect.top;
    setPlacement(spaceBelow < menuHeight && spaceAbove > spaceBelow ? "up" : "down");
  }, [showSuggestions, suggestions.length]);

  return (
    <div className="relative" ref={fieldRef}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        value={value}
        onChange={(v) => {
          if (!schoolId) {
            setSchoolRequiredError("Please first select school");
            return;
          }
          setSchoolRequiredError("");
          onChange(v);
          fetchTeachers(v, schoolId, 1, false);
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        error={schoolRequiredError || error}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className={`${placement === "up" ? "absolute bottom-full mb-1" : "absolute top-full mt-1"} left-0 right-0 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto`}>
          {loading && (
            <div className="px-4 py-3 text-center text-sm text-[#6B7280]">Searching...</div>
          )}
          {!loading && suggestions.map((teacher) => (
            <button
              key={teacher.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(teacher);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#F3F4F5] font-inter text-sm text-[#121212] border-b border-[#E0E0E2] last:border-b-0 transition-colors"
            >
              {teacher.name}
            </button>
          ))}
          {!loading && hasMore && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fetchTeachers(value, schoolId, page + 1, true)}
              disabled={loadingMore}
              className="w-full px-4 py-3 text-center font-inter text-sm text-[#0171F9] hover:bg-[#F3F4F5] disabled:opacity-60 transition-colors"
            >
              {loadingMore ? "Loading more..." : "Load more results"}
            </button>
          )}
        </div>
      )}
      {showSuggestions && !loading && suggestions.length === 0 && value.trim() && (
        <div className={`${placement === "up" ? "absolute bottom-full mb-1" : "absolute top-full mt-1"} left-0 right-0 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-10`}>
          <div className="px-4 py-3 text-center text-sm text-[#6B7280]">
            {schoolId
              ? "No teachers found - it will be created automatically when you save"
              : "No teachers found"}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[#0171F9]">{icon}</span>
      <h3 className="text-[#121212] font-inter text-base font-bold">{title}</h3>
    </div>
  );
}

function SelectedDayCard({ date, events, LoadingEventDetails }: { date: Date; events: CalendarEvent[], LoadingEventDetails: boolean }) {
  const dayLabel = format(date, "EEE, MMM d, yyyy");

  return (
    <div className="rounded-2xl border border-[#F0F0F0] bg-white overflow-hidden">
      <div className="border-b border-[#F0F0F0] px-4 py-4">
        <h3 className="text-[#121212] font-inter text-base font-bold">{dayLabel}</h3>
      </div>
      {!LoadingEventDetails ? (events.length === 0 ? (
        <div className="px-4 py-6 text-center text-[#9A9A9A] font-inter text-sm">
          No events for this day
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <span className="text-[#121212] font-inter text-sm font-semibold leading-snug">
                {event.title}
              </span>
            </div>
            <div className="flex flex-col gap-2 pl-4">
              <div className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.00142 12.3155C9.9017 12.3155 12.2528 9.95243 12.2528 7.0374C12.2528 4.12237 9.9017 1.75928 7.00142 1.75928C4.10114 1.75928 1.75 4.12237 1.75 7.0374C1.75 9.95243 4.10114 12.3155 7.00142 12.3155Z" stroke="#9A9A9A" strokeWidth="1.00653" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.41797 4.69141V7.6237H9.33542" stroke="#9A9A9A" strokeWidth="1.00653" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#9A9A9A] font-inter text-xs font-medium">
                  {format(event.start, "h:mm aa")} - {format(event.end, "h:mm aa")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M5.26562 6.45336H6.43561V7.6267H5.26562V6.45336ZM5.26562 4.10669H6.43561V5.28003H5.26562V4.10669ZM7.6056 6.45336H8.77559V7.6267H7.6056V6.45336ZM7.6056 4.10669H8.77559V5.28003H7.6056V4.10669Z" fill="#9A9A9A" />
                  <path d="M12.2848 5.28002H10.5298V2.93335H11.1148V1.76001H2.9249V2.93335H3.5099V5.28002H1.75492C1.43317 5.28002 1.16992 5.54402 1.16992 5.86669V11.7334C1.16992 12.056 1.43317 12.32 1.75492 12.32H12.2848C12.6065 12.32 12.8698 12.056 12.8698 11.7334V5.86669C12.8698 5.54402 12.6065 5.28002 12.2848 5.28002ZM2.33991 6.45336H3.5099V11.1467H2.33991V6.45336ZM5.84987 8.80003V11.1467H4.67988V2.93335H9.35983V11.1467H8.18984V8.80003H5.84987ZM11.6998 11.1467H10.5298V6.45336H11.6998V11.1467Z" fill="#9A9A9A" />
                </svg>
                <span className="text-[#9A9A9A] font-inter text-xs font-medium">{event.school_name || event.school}</span>
              </div>
              {event.reminders > 0 && (
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.95686 5.33776C2.95686 4.24857 3.39305 3.20399 4.16948 2.43381C4.9459 1.66364 5.99896 1.23096 7.09698 1.23096C8.19501 1.23096 9.24807 1.66364 10.0245 2.43381C10.8009 3.20399 11.2371 4.24857 11.2371 5.33776V7.54604L12.3147 9.68393C12.3643 9.78232 12.3877 9.89167 12.3828 10.0016C12.3778 10.1115 12.3446 10.2183 12.2862 10.3119C12.2279 10.4055 12.1465 10.4827 12.0496 10.5363C11.9527 10.5898 11.8436 10.6179 11.7327 10.6179H9.38824C9.25668 11.1214 8.96029 11.5674 8.54559 11.8857C8.13089 12.2041 7.62136 12.3768 7.09698 12.3768C6.57261 12.3768 6.06308 12.2041 5.64838 11.8857C5.23368 11.5674 4.93728 11.1214 4.80572 10.6179H2.46123C2.35032 10.6179 2.24125 10.5898 2.14438 10.5363C2.0475 10.4827 1.96604 10.4055 1.90773 10.3119C1.84941 10.2183 1.81619 10.1115 1.8112 10.0016C1.80622 9.89167 1.82964 9.78232 1.87925 9.68393L2.95686 7.54604V5.33776ZM6.0726 10.6179C6.17642 10.7963 6.32575 10.9444 6.50556 11.0474C6.68538 11.1504 6.88935 11.2046 7.09698 11.2046C7.30461 11.2046 7.50859 11.1504 7.6884 11.0474C7.86822 10.9444 8.01754 10.7963 8.12137 10.6179H6.0726ZM7.09698 2.40433C6.31268 2.40433 5.5605 2.71339 5.00591 3.26351C4.45132 3.81363 4.13976 4.55976 4.13976 5.33776V7.54604C4.13974 7.72811 4.09702 7.90768 4.01496 8.07054L3.32297 9.44456H10.8716L10.1796 8.07054C10.0973 7.90773 10.0544 7.72816 10.0542 7.54604V5.33776C10.0542 4.55976 9.74265 3.81363 9.18806 3.26351C8.63347 2.71339 7.88129 2.40433 7.09698 2.40433Z" fill="#0171F9" />
                  </svg>
                  <span className="text-[#0171F9] font-inter text-xs font-medium">{event.reminders} reminders</span>
                </div>
              )}
            </div>
          </div>
        ))
      )) : <div className="px-4 py-6 text-center text-[#9A9A9A] font-inter text-sm">
        Loading...
      </div>}
    </div>
  );
}

function UpcomingJobsCard({
  events,
  hasMore,
  loadingMore,
  onLoadMore,
  refershing,
  eventId
}: UpcomingJobsCardProps) {
  return (
    <div className="rounded-2xl border border-[#F0F0F0] bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#F0F0F0] bg-white px-4 py-4 flex items-center justify-between">
        <h3 className="text-[#121212] font-inter text-base font-bold">
          Upcoming Jobs
        </h3>
        {refershing ? <span className="text-sm text-[#0171f9] leading-[inherit]">Updating...</span> : ""}
      </div>

      {events.length === 0 ? (
        <div className="px-4 py-6 text-center text-[#9A9A9A] font-inter text-sm">
          No upcoming jobs
        </div>
      ) : (
        <>
          {/* Scrollable list */}
          <div className="max-h-[400px] overflow-y-auto">
            {events.map((event, idx) => {
              const isGroup = "grouped" in event && event.grouped;
              const members = isGroup ? (event as UpcomingJobGroup).members : null;

              return (
                <div
                  key={isGroup ? (event as UpcomingJobGroup).groupKey : (event as CalendarEvent).id}
                  className={`px-4 py-4 ${idx < events.length - 1 ? "border-b border-[#F0F0F0]" : ""} bg-white`}
                >
                  <div
                    onClick={!isGroup ? () => eventId({ event }) : undefined}
                    className={`flex items-start gap-2 ${!isGroup ? "cursor-pointer" : ""}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-[#121212] font-inter text-sm font-semibold">
                        {event.title}
                      </span>
                      <span className="text-[#9A9A9A] font-inter text-xs font-medium">
                        {isGroup && members
                          ? `${format(members[0].start, "EEE MMM d")} - ${format(members[members.length - 1].start, "EEE MMM d")} · ${format(members[0].start, "h:mm aa")} start`
                          : format((event as CalendarEvent).start, "EEE MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  {isGroup && members && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pl-4">
                      {members.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => eventId({ event: member })}
                          title={`${format(member.start, "h:mm aa")} - ${format(member.end, "h:mm aa")}`}
                          className="px-2 py-1 rounded-md border border-[#E5E5E5] font-inter text-xs text-[#121212] hover:bg-[#F3F4F5] transition-colors cursor-pointer"
                        >
                          {format(member.start, "EEE M/d")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {hasMore && (
            <div className="border-t border-[#F0F0F0] p-4 bg-white">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className={`${!loadingMore ? "cursor-pointer" : ""} w-full rounded-lg border border-[#E5E5E5] py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50`}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AddEventSidebar({
  isOpen,
  onClose,
  onSave,
  fetchUpcoming,
  initialDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void
  fetchUpcoming: () => void
  initialDate?: string | null;
}) {
  const today = format(new Date(), "yyyy-MM-dd");
  // Each day of a multi-day assignment gets its own date + start/end time -
  // a single-day job is simply a dayEntries array of length 1. See
  // MAX_ASSIGNMENT_DAYS for the shared client+server day-count limit. Any
  // day of the week, including Sunday, is a valid pick.
  // startTimeTouched/endTimeTouched/dateTouched mark a day (other than the
  // first) as manually edited by the guest teacher, so it stops following
  // Day 1's time, or stops being auto-recomputed when an earlier day's
  // date shifts. Day 1 is always the "source" - its own fields are never
  // marked touched.
  const [dayEntries, setDayEntries] = useState<{ date: string; startTime: string; endTime: string; dateTouched?: boolean; startTimeTouched?: boolean; endTimeTouched?: boolean }[]>([
    { date: today, startTime: "", endTime: "" },
  ]);
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolId, setSchoolId] = useState<any>();
  const { data: session } = useSession();
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState<any>();
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const formRef1 = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");

  // Applies a double-clicked date each time the form opens with one, without
  // touching reset()/handleSave's own use of `today` - a plain "Add Job /
  // Event" open (initialDate null) still defaults to today exactly as before.
  useEffect(() => {
    if (isOpen && initialDate) {
      setDayEntries([{ date: initialDate, startTime: "", endTime: "" }]);
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    scrollToFirstError(errors, formRef1);
  }, [errors]);

  const reset = () => {
    setDayEntries([{ date: today, startTime: "", endTime: "" }]);
    setSchoolName(""); setSchoolAddress("");
    setSchoolPhone(""); setSchoolEmail("");
    setTeacherName(""); setTeacherPhone(""); setTeacherEmail("");
    setNotes("");
    setTitle("");
    setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  // Day 1's start/end time is pre-filled into every other day that hasn't
  // been manually edited yet - editing Day 1 keeps those days in sync, but
  // touching a specific day's own time field opts that one day out (it
  // stops following Day 1) while leaving the rest still synced.
  const handleDayStartTimeChange = (idx: number, value: string) => {
    setErrors((prev) => ({ ...prev, [`day-${idx}-startTime`]: "" }));
    setDayEntries((prev) =>
      prev.map((day, i) => {
        if (i === idx) return { ...day, startTime: value, ...(idx > 0 && { startTimeTouched: true }) };
        if (idx === 0 && i > 0 && !day.startTimeTouched) return { ...day, startTime: value };
        return day;
      })
    );
  };

  const handleDayEndTimeChange = (idx: number, value: string) => {
    setErrors((prev) => ({ ...prev, [`day-${idx}-endTime`]: "" }));
    setDayEntries((prev) =>
      prev.map((day, i) => {
        if (i === idx) return { ...day, endTime: value, ...(idx > 0 && { endTimeTouched: true }) };
        if (idx === 0 && i > 0 && !day.endTimeTouched) return { ...day, endTime: value };
        return day;
      })
    );
  };

  // The min a given day's date picker will accept: today for the first
  // day, or the day immediately after the previous row's date. Native
  // `min` only steers the picker UI - handleDayDateChange below is what
  // actually enforces the rule, since `min` alone can be bypassed (typed
  // input, browsers that ignore it, or a stale previous-day value).
  const dayMinDate = (idx: number) => {
    if (idx === 0) return today;
    const prevDate = dayEntries[idx - 1]?.date;
    if (!prevDate) return today;
    const d = new Date(`${prevDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return format(d, "yyyy-MM-dd");
  };

  const nextCalendarDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return format(d, "yyyy-MM-dd");
  };

  // After a day's date changes, keep every later day chronological: a
  // later day the guest teacher already set by hand (dateTouched) is left
  // alone as long as it's still after the day before it; every other later
  // day is auto prefilled with the next calendar day in sequence - so
  // moving Day 1 pushes Day 2, Day 3, etc. forward in order instead of
  // just clearing them, while any day they've manually chosen keeps its
  // own date until it would conflict.
  const cascadeDatesForward = (
    entries: { date: string; startTime: string; endTime: string; dateTouched?: boolean; startTimeTouched?: boolean; endTimeTouched?: boolean }[],
    fromIdx: number
  ) => {
    const next = [...entries];
    let previous = next[fromIdx].date;
    for (let i = fromIdx + 1; i < next.length; i++) {
      const day = next[i];
      if (day.dateTouched && day.date && day.date > previous) {
        previous = day.date;
        continue;
      }
      const auto = nextCalendarDate(previous);
      next[i] = { ...day, date: auto, dateTouched: false };
      previous = auto;
    }
    return next;
  };

  const handleDayDateChange = (idx: number, value: string) => {
    const prevDate = idx > 0 ? dayEntries[idx - 1].date : null;
    if (value && prevDate && value <= prevDate) {
      setErrors((prev) => ({
        ...prev,
        [`day-${idx}-date`]: "Date must be after the previous day",
      }));
      return;
    }

    setDayEntries((prev) => {
      const updatedSelf = prev.map((day, i) =>
        i === idx ? { ...day, date: value, ...(idx > 0 && { dateTouched: true }) } : day
      );
      return cascadeDatesForward(updatedSelf, idx);
    });

    setErrors((prev) => {
      const updated = { ...prev, [`day-${idx}-date`]: "", days: "" };
      for (let i = idx + 1; i < dayEntries.length; i++) {
        updated[`day-${i}-date`] = "";
      }
      return updated;
    });
  };

  const addDay = () => {
    if (dayEntries.length >= MAX_ASSIGNMENT_DAYS) return;

    const last = dayEntries[dayEntries.length - 1];
    const date = last?.date ? nextCalendarDate(last.date) : format(new Date(), "yyyy-MM-dd");

    const first = dayEntries[0];
    setDayEntries((prev) => [
      ...prev,
      { date, startTime: first?.startTime ?? "", endTime: first?.endTime ?? "" },
    ]);
  };

  const removeDay = (idx: number) => {
    setDayEntries((prev) => prev.filter((_, i) => i !== idx));
    // Removing a row shifts every later row's index, which would otherwise
    // leave day-N-* errors attached to the wrong row - clearing everything
    // is simplest and safe since validateForm() recomputes on next submit.
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (dayEntries.length > MAX_ASSIGNMENT_DAYS) {
      newErrors.days = `A maximum of ${MAX_ASSIGNMENT_DAYS} days is allowed`;
    }

    const getMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    let previousDate: string | null = null;
    dayEntries.forEach((day, idx) => {
      if (!day.date.trim()) {
        newErrors[`day-${idx}-date`] = "Date is required";
      } else {
        if (previousDate && day.date <= previousDate) {
          newErrors[`day-${idx}-date`] = "Date must be after the previous day";
        }
        previousDate = day.date;
      }

      if (!day.startTime) {
        newErrors[`day-${idx}-startTime`] = "Start time is required";
      }
      if (!day.endTime) {
        newErrors[`day-${idx}-endTime`] = "End time is required";
      }
      if (day.startTime && day.endTime && getMinutes(day.endTime) <= getMinutes(day.startTime)) {
        newErrors[`day-${idx}-endTime`] = "End time must be after start time";
      }
    });

    if (!schoolName.trim()) {
      newErrors.schoolName = "School name is required";
    }

    if (!schoolAddress.trim()) {
      newErrors.schoolAddress = "School address is required";
    }


    if (schoolEmail.trim() && !isValidEmail(schoolEmail)) {
      newErrors.schoolEmail = "Invalid email address";
    }

    if (teacherEmail.trim() && !isValidEmail(teacherEmail)) {
      newErrors.teacherEmail = "Invalid email address";
    }

    if (schoolPhone.trim() && !isValidPhone(schoolPhone)) {
      newErrors.schoolPhone = "Invalid phone number";
    }

    if (teacherPhone.trim() && !isValidPhone(teacherPhone)) {
      newErrors.teacherPhone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Resolve the teacher before creating anything - if this throws, the
      // catch below reports it and no event is created.
      const resolvedTeacherId = await resolveOrCreateTeacherId(teacherName, teacherId, schoolId);

      const eventColors = getRandomEventColors();

      const events = dayEntries.map((day) => {
        const [y, m, d] = day.date.split("-").map(Number);
        const [sh, smin] = day.startTime.split(":").map(Number);
        const [eh, emin] = day.endTime.split(":").map(Number);

        return {
          title: title,
          date: day.date,
          start: new Date(y, m - 1, d, sh, smin).toISOString(),
          end: new Date(y, m - 1, d, eh, emin).toISOString(),
          school: schoolName,
          schoolAddress,
          schoolPhone: schoolPhone.trim() || null,
          schoolEmail: schoolEmail.trim() || null,
          schoolId: schoolId || null,
          teacherName: teacherName.trim() || null,
          teacherId: resolvedTeacherId,
          teacherPhone: teacherPhone.trim() || null,
          teacherEmail: teacherEmail.trim() || null,
          notes: notes.trim() || null,
          ...eventColors,
          reminders: 0,
          user_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
          user_id: session?.user?.id
        };
      });


      const response = await fetch("/api/calendar-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save events");
      }

      const data = await response.json();
     
      data?.events?.forEach((event: any) => {
        onSave({
          id: event.id,
          title: event.title,
          start: new Date(event.start_date),
          end: new Date(event.end_date),
          school: event.school_name,
          school_name: event.school_name,
          color: event.color,
          borderColor: event.color,
          bgColor: event.bg_color,
          reminders: event.reminders,
          user_id: event.user_id,
        });
      });

      reset();
      fetchUpcoming();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save event";
      setErrors({ submit: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[560px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        ref={formRef1}
      >
        <div className="flex items-center justify-between px-6 py-5 pb-7 border-b border-[#E8E8E8] mb-[30px] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M4.66602 6.99992C4.66602 6.6905 4.78893 6.39375 5.00772 6.17496C5.22652 5.95617 5.52326 5.83325 5.83268 5.83325H22.166C22.4754 5.83325 22.7722 5.95617 22.991 6.17496C23.2098 6.39375 23.3327 6.6905 23.3327 6.99992V11.6666H4.66602V6.99992Z" stroke="#0171F9" strokeWidth="2.33333" strokeLinejoin="round" />
              <path d="M9.33203 7.58325V4.08325M18.6654 7.58325V4.08325" stroke="#0171F9" strokeWidth="2.33333" strokeLinecap="round" />
              <path d="M4.66602 11.6665H23.3327V22.1665C23.3327 22.4759 23.2098 22.7727 22.991 22.9915C22.7722 23.2103 22.4754 23.3332 22.166 23.3332H5.83268C5.52326 23.3332 5.22652 23.2103 5.00772 22.9915C4.78893 22.7727 4.66602 22.4759 4.66602 22.1665V11.6665Z" stroke="#0171F9" strokeWidth="2.33333" strokeLinejoin="round" />
            </svg>
            <h2 className="text-[#121212] font-inter text-lg font-bold">Add Job / Event</h2>
          </div>
          <button onClick={handleClose} className="text-[#6B727F] hover:text-[#6B727F] transition-colors cursor-pointer p-1" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 flex flex-col hide-scrollbar">
          {/* <div>
            <SectionHeader
              title="Job / Event Details"
              icon={
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.049 1.99292H9.36599C8.85085 1.99292 8.38254 2.19222 8.02797 2.51109C7.6734 2.19222 7.20509 1.99292 6.68995 1.99292H2.0069C1.63894 1.99292 1.33789 2.29187 1.33789 2.65725V12.6221C1.33789 12.9875 1.63894 13.2865 2.0069 13.2865H5.86038C6.21496 13.2865 6.55615 13.426 6.80369 13.6784L7.55298 14.4224C7.55298 14.4224 7.56636 14.4291 7.57305 14.4357C7.63326 14.4889 7.69347 14.5354 7.76706 14.5686C7.84734 14.6018 7.93431 14.6217 8.02128 14.6217C8.10825 14.6217 8.19522 14.6018 8.2755 14.5686C8.34909 14.5354 8.416 14.4889 8.46952 14.4357C8.46952 14.4357 8.4829 14.4291 8.48959 14.4224L9.23888 13.6784C9.48641 13.4326 9.83429 13.2865 10.1822 13.2865H14.0357C14.4036 13.2865 14.7047 12.9875 14.7047 12.6221V2.65725C14.7047 2.29187 14.4036 1.99292 14.0357 1.99292H14.049ZM5.86038 11.9578H2.67591V3.32157H6.68995C7.05791 3.32157 7.35896 3.62052 7.35896 3.9859V12.4162C6.91742 12.1239 6.39559 11.9578 5.86038 11.9578ZM13.38 11.9578H10.1956C9.66035 11.9578 9.13852 12.1239 8.69698 12.4162V3.9859C8.69698 3.62052 8.99803 3.32157 9.36599 3.32157H13.38V11.9578Z" fill="#0171F9" />
                </svg>
              }
            />
            <hr className="border-[#E8E8E8] mb-[30px]" />
          </div> */}
          <div className="flex flex-col gap-4" >
            <div className="relative">
              <FieldLabel required>Event Title</FieldLabel>
              <TextInput
                value={title}
                id="title"
                onChange={(value: string) => {
                  setErrors((prev) => ({
                    ...prev,
                    title: "",
                  }))
                  setTitle(value);
                }}
                error={errors.title}
              />
            </div>

          </div>
          <hr className="border-[#E8E8E8] my-[30px]" />

          <div>
            <SectionHeader
              title="Date & Time"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="#0171F9" strokeWidth="1.5" />
                  <path d="M9 5.5V9L11.5 11.5" stroke="#0171F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              {dayEntries.map((day, idx) => (
                <div key={idx} className="rounded-lg border border-[#E8E8E8] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#121212] font-inter text-sm font-semibold">Day {idx + 1}</span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDay(idx)}
                        className="text-[#6B727F] hover:text-red-600 transition-colors cursor-pointer p-0.5"
                        aria-label={`Remove day ${idx + 1}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                          <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <FieldLabel required>Date</FieldLabel>
                      <DateField
                        id={`day-${idx}-date`}
                        value={day.date}
                        min={dayMinDate(idx)}
                        onChange={(v) => handleDayDateChange(idx, v)}
                        error={errors[`day-${idx}-date`]}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Start Time</FieldLabel>
                      <input
                        type="time"
                        value={day.startTime}
                        id={`day-${idx}-startTime`}
                        onChange={(e) => handleDayStartTimeChange(idx, e.target.value)}
                        className={`w-full rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 transition-all ${errors[`day-${idx}-startTime`] ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                          }`}
                      />
                      {errors[`day-${idx}-startTime`] && <p className="text-red-500 text-xs mt-1">{errors[`day-${idx}-startTime`]}</p>}
                    </div>
                    <div>
                      <FieldLabel required>End Time</FieldLabel>
                      <input
                        type="time"
                        value={day.endTime}
                        id={`day-${idx}-endTime`}
                        onChange={(e) => handleDayEndTimeChange(idx, e.target.value)}
                        className={`w-full rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 transition-all ${errors[`day-${idx}-endTime`] ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                          }`}
                      />
                      {errors[`day-${idx}-endTime`] && <p className="text-red-500 text-xs mt-1">{errors[`day-${idx}-endTime`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
              {errors.days && <p className="text-red-500 text-xs">{errors.days}</p>}
              <button
                type="button"
                onClick={addDay}
                disabled={dayEntries.length >= MAX_ASSIGNMENT_DAYS}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#0171F9]/40 text-[#0171F9] font-inter text-sm font-semibold hover:bg-[#0171F9]/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                + Add Another Day{dayEntries.length >= MAX_ASSIGNMENT_DAYS ? " (Max 6 days)" : ""}
              </button>
            </div>
          </div>
          <hr className="border-[#E8E8E8] my-[30px]" />
          <div className="h-px bg-[#E8E8E8]" />

          <div>
            <SectionHeader
              title="School Information"
              icon={
                <svg width="19" height="19" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.89258 7.17192H7.20199V8.4759H5.89258V7.17192ZM5.89258 4.56396H7.20199V5.86794H5.89258V4.56396ZM8.51141 7.17192H9.82083V8.4759H8.51141V7.17192ZM8.51141 4.56396H9.82083V5.86794H8.51141V4.56396Z" fill="#0171F9" />
                  <path d="M13.748 5.86774H11.7839V3.25979H12.4386V1.95581H3.27272V3.25979H3.92743V5.86774H1.9633C1.60321 5.86774 1.30859 6.16114 1.30859 6.51973V13.0396C1.30859 13.3982 1.60321 13.6916 1.9633 13.6916H13.748C14.1081 13.6916 14.4028 13.3982 14.4028 13.0396V6.51973C14.4028 6.16114 14.1081 5.86774 13.748 5.86774ZM2.61801 7.17172H3.92743V12.3876H2.61801V7.17172ZM6.54626 9.77967V12.3876H5.23684V3.25979H10.4745V12.3876H9.16509V9.77967H6.54626ZM13.0933 12.3876H11.7839V7.17172H13.0933V12.3876Z" fill="#0171F9" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              <SchoolSearchInput
                id="schoolName"
                value={schoolName}
                required
                error={errors.schoolName}
                onChange={(value) => {
                  setErrors((prev) => ({ ...prev, schoolName: "" }));
                  setSchoolName(value);
                  setSchoolId("");
                }}
                onSelect={(school) => {
                  setSchoolAddress(`${school.street_address}, ${school.city}, ${school.state}, ${school.zipcode}`);
                  setSchoolName(school.school_name);
                  setSchoolId(school.id);
                }}
              />
              <div id="schoolAddress">
                <FieldLabel required>School Address</FieldLabel>
                <TextInput
                  value={schoolAddress}

                  onChange={setSchoolAddress}
                  placeholder="e.g. 3501 Lincoln Blvd, Los Angeles, CA"
                  error={errors.schoolAddress}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>School Phone</FieldLabel>
                  <TextInput
                    value={schoolPhone}
                    onChange={setSchoolPhone}
                    placeholder="(213)555-0000"
                    error={errors.schoolPhone}
                  />
                </div>
                <div>
                  <FieldLabel>School Email</FieldLabel>
                  <TextInput
                    value={schoolEmail}
                    onChange={setSchoolEmail}
                    placeholder="admin@school.edu"
                    error={errors.schoolEmail}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr className="border-[#E8E8E8] my-[30px]" />
          <div className="h-px bg-[#E8E8E8]" />

          <div>
            <SectionHeader
              title="Classroom teacher's Info"
              icon={
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3.5" stroke="#0171F9" strokeWidth="1.5" />
                  <path d="M2 16.5C2 13.4624 5.13401 11 9 11C12.866 11 16 13.4624 16 16.5" stroke="#0171F9" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              <TeacherSearchInput
                value={teacherName}
                schoolId={schoolId}
                onChange={(value) => {
                  setTeacherName(value);
                  setTeacherId("");
                }}
                onSelect={(teacher) => {
                  setTeacherName(teacher.name);
                  setTeacherId(teacher.id);
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Teacher's Phone</FieldLabel>
                  <TextInput
                    value={teacherPhone}
                    onChange={setTeacherPhone}
                    placeholder="(213)555-0000"
                    error={errors.teacherPhone}
                  />
                </div>
                <div>
                  <FieldLabel>Teacher's Email</FieldLabel>
                  <TextInput
                    value={teacherEmail}
                    onChange={setTeacherEmail}
                    placeholder="teacher@school.edu"
                    error={errors.teacherEmail}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes here..."
                  rows={4}
                  className="w-full bg-[#F5F6FA] border-0 rounded-lg px-4 py-3 text-sm font-inter text-[#121212] placeholder:text-[#ADADAD] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E8E8E8]" />
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-[#E8E8E8] mt-[30px] flex flex-col gap-3 bg-white">
          {errors.submit && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-[#E2E2E2] text-[#121212] font-inter text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-[#0171F9] text-white font-inter text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Event"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayEvent, setSelectedDayEvent] = useState<CalendarEvent[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<UpcomingJobItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Set when a calendar day is double-clicked, so Add Event opens pre-filled
  // with that date instead of today. Kept as the plain "YYYY-MM-DD" string
  // each day cell's own data-date attribute already provides, never
  // round-tripped through a Date object, so there's no UTC/local conversion
  // to shift it.
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const calendarRef = useRef<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isLoadingEventDetails, setIsLoadingEventDetails] = useState(false);
  const [eventNavigation, setEventNavigation] = useState({
    previousEventExist: false,
    previousEventId: null as number | null,
    nextEventExist: false,
    nextEventId: null as number | null,
    event: {}
  });
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [refreshUpcoming, setRefreshUpcoming] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState<ObjectType>({});
  const [eventLoader, setEventLoader] = useState<boolean>(false);
  const [errors2, setErrors2] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const lastMonth = useRef("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "guest_teacher") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "guest_teacher") {
      fetchEvents((currentDate.getMonth() + 1), currentDate.getFullYear());
      setSelectedMonthYear({ month: (currentDate.getMonth() + 1), year: currentDate.getFullYear() });
    }
  }, [status]);

  const fetchEvents = async (month: any, year: any, selectedDay?: any) => {

    try {
      setEvents([]);
      const response = await fetch(`/api/calendar-events/get?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();

        const mappedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));

        setEvents(mappedEvents);

        if (isLoadingEvents) {
          setSelectedDay(new Date());
        }
        if (selectedDay) {
          setSelectedDay(selectedDay);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
      setEventLoader(false);

    }
  };


  const fetchUpcomingJobs = async (currentOffset = 0) => {
    try {
      if (currentOffset != 0) {
        setLoadingMore(true);
      } else {
        setRefreshUpcoming(true);
      }


      const response = await fetch(
        `/api/calendar-events/upcoming?limit=5&offset=${currentOffset}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch upcoming jobs");
      }

      const data = await response.json();

      const jobs: UpcomingJobItem[] = data.events.map((item: any) => {
        if (item.grouped) {
          return {
            ...item,
            bgColor: item.bg_color,
            members: item.members.map((member: any) => ({
              ...member,
              start: new Date(member.start_date),
              end: new Date(member.end_date),
              bgColor: member.bg_color,
            })),
          };
        }
        return {
          ...item,
          start: new Date(item.start_date),
          end: new Date(item.end_date),
        };
      });

      const jobKey = (job: UpcomingJobItem) => ("grouped" in job && job.grouped ? job.groupKey : (job as CalendarEvent).id);

      if (currentOffset === 0) {
        setUpcomingJobs(jobs);
      } else {
        setUpcomingJobs((prev) => {
          const existingKeys = new Set(prev.map(jobKey));
          const newJobs = jobs.filter((job) => !existingKeys.has(jobKey(job)));

          return [...prev, ...newJobs];
        });
      }

      // Use values returned by the API
      setHasMore(data.hasMore);
      setOffset(data.nextOffset ?? currentOffset);
    } catch (error) {
      console.error("Error fetching upcoming jobs:", error);
    } finally {
      setLoadingMore(false);
      setRefreshUpcoming(false);
    }
  };

  useEffect(() => {
    fetchUpcomingJobs(0);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;

    fetchUpcomingJobs(offset);
  };
  const handleAddEvent = (eventData: CalendarEvent) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: eventData.id,
    };
    setEvents((prev) => [...prev, newEvent]);
    setSelectedDay(newEvent.start);
    setCurrentDate(newEvent.start);
  };



  const handleSelectEvent = async (info: any) => {
    if (selectedDay != new Date(info.event.start)) {
      setSelectedDay(new Date(info.event.start));
    }
    setErrors2({});
    const eventId = info.event.id;
    setIsLoadingEventDetails(true);
    try {
      const response = await fetch(`/api/calendar-events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        const event = data.event;
        setSelectedEvent(event);
        setSelectedDay(event.start_date);
        setEventNavigation({
          previousEventExist: data.previousEventExist,
          previousEventId: data.previousEventId,
          nextEventExist: data.nextEventExist,
          nextEventId: data.nextEventId,
          event: data.event
        });

        const eventDate = new Date(event.start_date);

        if (
          eventDate.getMonth() + 1 !== selectedMonthYear.month ||
          eventDate.getFullYear() !== selectedMonthYear.year
        ) {
          fetchEvents(
            eventDate.getMonth() + 1,
            eventDate.getFullYear(),
            eventDate
          );

          // Change calendar to the event's month
          calendarRef.current?.getApi().gotoDate(eventDate);
        }
        setEditFormData({
          title: event.title || "",
          start_date: event.start_date || "",
          end_date: event.end_date || "",
          school_name: event.school_name || "",
          school_address: event.school_address || "",
          school_phone: event.school_phone || "",
          school_email: event.school_email || "",
          school_id: event.school_id || null,
          teacher_name: event.teacher_name || "",
          teacher_id: event.teacher_id || null,
          teacher_phone: event.teacher_phone || "",
          teacher_email: event.teacher_email || "",
          notes: event.notes || "",
          user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      } else {
        console.error("Failed to fetch event:", response.status);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setEventLoader(false);
      setIsLoadingEventDetails(false);
    }
  };

  const navigateEvent = (direction: -1 | 1) => {
    const eventId = direction === -1
      ? eventNavigation.previousEventId
      : eventNavigation.nextEventId;

    if (!eventId || !selectedEvent) return;
    setIsEditingEvent(false);

    setEventLoader(true);
   
    handleSelectEvent({ event: { id: eventId, start: selectedEvent.start_date } });
  };

  useEffect(() => {
    setSelectedDayEvent(events.filter((e) => {
      const eStart = new Date(e.start);
      const eEnd = new Date(e.end);
      const selected = new Date(selectedDay);
      selected.setHours(0, 0, 0, 0);
      eStart.setHours(0, 0, 0, 0);
      eEnd.setHours(0, 0, 0, 0);
      return (eStart <= selected && selected <= eEnd);
    }));
  }, [selectedDay]);

  const handleSelectDate = (info: any) => {
    setSelectedDay(new Date(info.dateStr));
  };

  // Opens Add Event pre-filled with a specific date (from a day-cell double
  // click - see dayCellDidMount below). Add Event's own date fields don't
  // allow a past date (min={today}), so a double-click on a past day still
  // opens the form pre-filled at today rather than landing on a date the
  // form would reject.
  const openAddEventForDate = (dateStr: string) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    setPrefilledDate(dateStr < todayStr ? todayStr : dateStr);
    setIsSidebarOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!editFormData.start_date.trim()) {
      newErrors.date = "Date is required";
      newErrors.start_time = "Start time is required";
    }

    if (!editFormData.end_date.trim()) {
      newErrors.end_time = "End time is required";
    }

    if (editFormData.start_date && editFormData.end_date) {
      const start = new Date(editFormData.start_date);
      const end = new Date(editFormData.end_date);

      const startDate = start.toLocaleDateString("en-CA"); // YYYY-MM-DD
      const endDate = end.toLocaleDateString("en-CA");

      const startTime = start.toLocaleTimeString("en-GB", { hour12: false });
      const endTime = end.toLocaleTimeString("en-GB", { hour12: false });


      if (startDate !== endDate) {
        newErrors.end_time = "End time must be on the same date as the start time";
      } else if (startTime >= endTime) {
        newErrors.end_time = "End time must be after start time";
      }
    }
    if (!editFormData.school_name.trim()) {
      newErrors.school_name = "School name is required";
    }

    if (!editFormData.school_address.trim()) {
      newErrors.school_address = "School address is required";
    }

    setErrors2(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEventChanges = async () => {

    if (!selectedEvent) return;
    if (!validateForm()) return;

    setIsSavingEvent(true);
    try {
      // Resolve the teacher before saving anything - if this throws, the
      // catch below reports it and the event is left unchanged.
      const resolvedTeacherId = await resolveOrCreateTeacherId(
        editFormData.teacher_name || "",
        editFormData.teacher_id,
        editFormData.school_id
      );

      const response = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFormData, teacher_id: resolvedTeacherId }),
      });

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      const updatedEvent = await response.json();
      setErrors2({});
      setIsEditingEvent(false);
      const updatedEventData = {
        ...updatedEvent.event,
        id: updatedEvent.event.id,
        title: updatedEvent.event.title,
        start: new Date(updatedEvent.event.start_date),
        end: new Date(updatedEvent.event.end_date),
        bgColor: updatedEvent.event.bg_color,
        borderColor: updatedEvent.event.bg_color,
        textColor: updatedEvent.event.color,
        color: updatedEvent.event.color,
      };

      const updateEventList = (events: any[]) =>
        events.map((event) =>
          event.id === updatedEventData.id ? updatedEventData : event
        );


      setEvents(updateEventList);
      setSelectedDay(updatedEventData.start);
      fetchUpcomingJobs(0);
      setSelectedEvent(updatedEventData);
    } catch (error) {
      console.error("Error saving event:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save event";
      setErrors2((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setSelectedEvent(null);

      setSelectedDayEvent((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id));

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );
      setUpcomingJobs((prevJobs) =>
        prevJobs
          .map((job) => {
            if (!("grouped" in job && job.grouped)) return job;
            const members = job.members.filter((member) => member.id !== selectedEvent.id);
            if (members.length === job.members.length) return job;
            return members.length === 1 ? members[0] : { ...job, members };
          })
          .filter((job) => {
            if ("grouped" in job && job.grouped) return job.members.length > 0;
            return (job as CalendarEvent).id !== selectedEvent.id;
          })
      );
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  useEffect(() => {
    scrollToFirstError(errors2, formRef);
  }, [errors2]);


  if (status === "unauthenticated") return null;

  if (status === "authenticated" && session?.user?.role !== "guest_teacher") return null;

  const totalEvents = events.length;

  const fullCalendarEvents = events.map((event) => ({

    id: event.id.toString(),
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    backgroundColor: event.bgColor,
    borderColor: event.bgColor,
    textColor: event.color,
    color: event.bgColor,
    extendedProps: {
      school: event.school,
      reminders: event.reminders,
    },
  }));



  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFE]">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-14 py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4.66602 6.99992C4.66602 6.6905 4.78893 6.39375 5.00772 6.17496C5.22652 5.95617 5.52326 5.83325 5.83268 5.83325H22.166C22.4754 5.83325 22.7722 5.95617 22.991 6.17496C23.2098 6.39375 23.3327 6.6905 23.3327 6.99992V11.6666H4.66602V6.99992Z" stroke="#0171F9" strokeWidth="2.33333" strokeLinejoin="round" />
              <path d="M9.33203 7.58325V4.08325M18.6654 7.58325V4.08325" stroke="#0171F9" strokeWidth="2.33333" strokeLinecap="round" />
              <path d="M4.66602 11.6665H23.3327V22.1665C23.3327 22.4759 23.2098 22.7727 22.991 22.9915C22.7722 23.2103 22.4754 23.3332 22.166 23.3332H5.83268C5.52326 23.3332 5.22652 23.2103 5.00772 22.9915C4.78893 22.7727 4.66602 22.4759 4.66602 22.1665V11.6665Z" stroke="#0171F9" strokeWidth="2.33333" strokeLinejoin="round" />
            </svg>
            <h1 className="text-[#121212] font-inter text-2xl sm:text-[28px] font-bold">My Calendar</h1>
            {(!isLoadingEvents && totalEvents > 0) ? <span className="px-2 py-1 rounded bg-[#DFEEFF] text-[#0171F9] font-inter text-xs font-semibold">
              {totalEvents} Events
            </span> : ""}
          </div>
          <button
            onClick={() => { setPrefilledDate(null); setIsSidebarOpen(true); }}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-[#0171F9] text-white font-inter text-sm sm:text-base font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9.99822 3.33301C10.2192 3.33301 10.4312 3.4208 10.5874 3.57707C10.7437 3.73334 10.8315 3.94528 10.8315 4.16628V9.16593H15.8311C16.0521 9.16593 16.2641 9.25372 16.4204 9.40999C16.5766 9.56626 16.6644 9.7782 16.6644 9.9992C16.6644 10.2202 16.5766 10.4321 16.4204 10.5884C16.2641 10.7447 16.0521 10.8325 15.8311 10.8325H10.8315V15.8321C10.8315 16.0531 10.7437 16.2651 10.5874 16.4213C10.4312 16.5776 10.2192 16.6654 9.99822 16.6654C9.77723 16.6654 9.56528 16.5776 9.40901 16.4213C9.25274 16.2651 9.16495 16.0531 9.16495 15.8321V10.8325H4.16531C3.94431 10.8325 3.73236 10.7447 3.57609 10.5884C3.41982 10.4321 3.33203 10.2202 3.33203 9.9992C3.33203 9.7782 3.41982 9.56626 3.57609 9.40999C3.73236 9.25372 3.94431 9.16593 4.16531 9.16593H9.16495V4.16628C9.16495 3.94528 9.25274 3.73334 9.40901 3.57707C9.56528 3.4208 9.77723 3.33301 9.99822 3.33301Z" fill="white" />
            </svg>
            Add Job / Event
          </button>
        </div>
        {(isLoadingEvents) ? <PageLoader message="Loading Calendar..." className="min-h-[600px] flex items-center justify-center bg-[#F8FAFE]" /> : ""}
        {!isLoadingEvents && <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0 rounded-2xl border border-[#E2E2E2] bg-white overflow-hidden">
            <FullCalendar
              ref={calendarRef}
              displayEventTime={false}

              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              customButtons={{
                prev: {
                  click: () => {
                    const api = calendarRef.current.getApi();
                    api.prev();

                    const date = api.getDate();
                    fetchEvents(date.getMonth() + 1, date.getFullYear());
                  },
                },
                next: {
                  click: () => {
                    const api = calendarRef.current.getApi();
                    api.next();

                    const date = api.getDate();
                    fetchEvents(date.getMonth() + 1, date.getFullYear());
                  },
                },
                today: {
                  text: "today",
                  click: () => {
                    const api = calendarRef.current.getApi();
                    api.today();

                    const date = api.getDate();
                    fetchEvents(date.getMonth() + 1, date.getFullYear());
                  },
                },
              }}
              datesSet={(info) => {
                const month = info.view.currentStart.getMonth() + 1;
                const year = info.view.currentStart.getFullYear();

                const key = `${year}-${month}`;

                if (lastMonth.current === key) return;

                lastMonth.current = key;
                setSelectedMonthYear({ month, year });
                // fetchEvents(month, year);
              }}

              height="auto"
              contentHeight="auto"
              events={fullCalendarEvents}
              dateClick={handleSelectDate}
              dayCellDidMount={(info) => {
                // FullCalendar has no dedicated double-click prop, and its
                // own dateClick doesn't reliably fire twice for a fast
                // double-click, so the native browser dblclick event is used
                // directly on each day cell. This is fully independent of
                // dateClick/handleSelectDate above (which still runs on
                // every single click exactly as before), and reads the
                // cell's own data-date attribute rather than info.date, to
                // avoid any Date-object/timezone round-trip.
                const dateStr = info.el.getAttribute("data-date");
                if (!dateStr) return;
                info.el.addEventListener("dblclick", () => openAddEventForDate(dateStr));
              }}
              eventClick={handleSelectEvent}
              eventDidMount={(info) => {
                const { backgroundColor, borderColor, textColor } = info.event;

                // Multi-day bar events
                if (info.el.classList.contains("fc-h-event")) {
                  Object.assign(info.el.style, {
                    backgroundColor,
                    borderColor,
                    color: textColor,
                  });
                }

                // Month-view dot events
                const dot = info.el.querySelector(".fc-daygrid-event-dot") as HTMLElement | null;
                if (dot) {
                  dot.style.borderColor = backgroundColor;
                }

                const title = info.el.querySelector(".fc-event-title") as HTMLElement | null;
                if (title) {
                  title.style.color = textColor;
                }
              }}
              eventDisplay="block"
            />
          </div>

          <div className="xl:w-[350px] flex-shrink-0 flex flex-col gap-4">
            <SelectedDayCard date={selectedDay} events={selectedDayEvent} LoadingEventDetails={eventLoader} />
            <UpcomingJobsCard
              events={upcomingJobs}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
              refershing={refreshUpcoming}
              eventId={(event) => {
                if (event.event.start.getMonth() + 1 != selectedMonthYear.month || event.event.start.getFullYear() != selectedMonthYear.year) {
                  fetchEvents(event.event.start.getMonth() + 1, event.event.start.getFullYear(), event.event.start);
                  // Change calendar to the event's month
                  calendarRef.current?.getApi().gotoDate(event.event.start);
                }
                handleSelectEvent(event);
              }}
            />
          </div>
        </div>}
      </main>

      <Footer />

      <AddEventSidebar
        isOpen={isSidebarOpen}
        onClose={() => { setIsSidebarOpen(false); setPrefilledDate(null); }}
        onSave={handleAddEvent}
        fetchUpcoming={fetchUpcomingJobs}
        initialDate={prefilledDate}
      />

      {selectedEvent && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] hide-scrollbar overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8] sticky top-0 bg-white">
              <h2 className="text-[#121212] font-inter text-lg font-bold">Event Details</h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-[5px]">
                  <button
                    onClick={() => navigateEvent(-1)}
                    disabled={isEditingEvent || isLoadingEventDetails || !eventNavigation.previousEventExist}
                    className="bg-[#0171F9] rounded-lg border border-[#E2E2E2] p-2 text-[#121212] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous event"
                    title="Previous"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M11 4L7 9L11 14" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateEvent(1)}
                    disabled={isEditingEvent || isLoadingEventDetails || !eventNavigation.nextEventExist}
                    className="bg-[#0171F9] rounded-lg border border-[#E2E2E2] p-2 text-[#121212] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next event"
                    title="Next"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M7 4L11 9L7 14" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button></div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-[#6B727F] hover:text-[#121212] transition-colors cursor-pointer p-1"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6" ref={formRef}>
              {!isEditingEvent ? (
                <>
                  <div>
                    {/* <h3 className="text-[#121212] font-inter text-base font-bold mb-4">Event Information</h3> */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[#9A9A9A] font-inter text-sm font-medium">Event Title</label>
                        <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.title}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Date</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{format(new Date(selectedEvent.start_date), "MMM d, yyyy")}</p>
                        </div>
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Start Time</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{format(new Date(selectedEvent.start_date), "h:mm aa")}</p>
                        </div>
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">End Time</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{format(new Date(selectedEvent.end_date), "h:mm aa")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E8E8E8]" />

                  <div>
                    <h3 className="text-[#121212] font-inter text-base font-bold mb-4">School Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[#9A9A9A] font-inter text-sm font-medium">School Name</label>
                        <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.school_name}</p>
                      </div>
                      <div>
                        <label className="text-[#9A9A9A] font-inter text-sm font-medium">Address</label>
                        <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.school_address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Phone</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.school_phone || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Email</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.school_email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E8E8E8]" />

                  <div>
                    <h3 className="text-[#121212] font-inter text-base font-bold mb-4">Teacher Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[#9A9A9A] font-inter text-sm font-medium">Name</label>
                        <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.teacher_name || "N/A"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Phone</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.teacher_phone || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Email</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.teacher_email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.notes && (
                    <>
                      <hr className="border-[#E8E8E8]" />
                      <div>
                        <h3 className="text-[#121212] font-inter text-base font-bold mb-1">Notes</h3>
                        <p className="text-[#121212] font-inter text-base rounded-lg">{selectedEvent.notes}</p>
                      </div>
                    </>
                  )}


                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 py-3 rounded-xl border border-[#E2E2E2] text-[#121212] font-inter text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => { setIsEditingEvent(true) }}
                      className="flex-1 py-3 rounded-xl bg-[#0171F9] text-white font-inter text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      title="Delete"
                      className="py-2 px-3 rounded-xl border border-red-300 text-red-600 font-inter text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>

                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div >
                    <FieldLabel required>Event Title</FieldLabel>
                    <TextInput
                      value={editFormData.title}
                      id="title"
                      onChange={(v) => setEditFormData({ ...editFormData, title: v })}
                      placeholder="Event title"
                      error={errors2.title}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div id="date">
                      <FieldLabel required>Date</FieldLabel>
                      <DateField
                        value={editFormData.start_date ? format(new Date(editFormData.start_date), "yyyy-MM-dd") : ""}
                        error={errors2.date}
                        onChange={(dateStr) => {
                          setErrors2((prev) => ({ ...prev, date: "" }));
                          if (!dateStr) {
                            setEditFormData({ ...editFormData, start_date: "", end_date: "" });
                            return;
                          }
                          const [y, m, d] = dateStr.split("-").map(Number);
                          // Keeps each time-of-day, only moving both timestamps
                          // onto the newly picked date.
                          const applyDate = (iso: string) => {
                            const t = new Date(iso);
                            return new Date(y, m - 1, d, t.getHours(), t.getMinutes()).toISOString();
                          };
                          setEditFormData({
                            ...editFormData,
                            start_date: editFormData.start_date ? applyDate(editFormData.start_date) : new Date(y, m - 1, d).toISOString(),
                            end_date: editFormData.end_date ? applyDate(editFormData.end_date) : "",
                          });
                        }}
                      />
                    </div>
                    <div id="start_time">
                      <FieldLabel required>Start Time</FieldLabel>
                      <input
                        type="time"
                        value={editFormData.start_date ? format(new Date(editFormData.start_date), "HH:mm") : ""}
                        onChange={(e) => {
                          setErrors2((prev) => ({ ...prev, start_time: "" }));
                          if (!e.target.value) return;
                          const base = editFormData.start_date ? new Date(editFormData.start_date) : new Date();
                          const [h, min] = e.target.value.split(":").map(Number);
                          setEditFormData({
                            ...editFormData,
                            start_date: new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, min).toISOString(),
                          });
                        }}
                        className={`w-full rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 transition-all ${errors2.start_time ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                          }`}
                      />
                      {errors2.start_time && <p className="text-red-500 text-xs mt-1">{errors2.start_time}</p>}
                    </div>
                    <div id="end_time">
                      <FieldLabel required>End Time</FieldLabel>
                      <input
                        type="time"
                        value={editFormData.end_date ? format(new Date(editFormData.end_date), "HH:mm") : ""}
                        onChange={(e) => {
                          setErrors2((prev) => ({ ...prev, end_time: "" }));
                          if (!e.target.value) return;
                          const base = editFormData.end_date
                            ? new Date(editFormData.end_date)
                            : editFormData.start_date
                              ? new Date(editFormData.start_date)
                              : new Date();
                          const [h, min] = e.target.value.split(":").map(Number);
                          setEditFormData({
                            ...editFormData,
                            end_date: new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, min).toISOString(),
                          });
                        }}
                        className={`w-full rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 transition-all ${errors2.end_time ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                          }`}
                      />
                      {errors2.end_time && <p className="text-red-500 text-xs mt-1">{errors2.end_time}</p>}
                    </div>
                  </div>

                  <hr className="border-[#E8E8E8]" />

                  <div>
                    <h3 className="text-[#121212] font-inter text-base font-bold mb-4">School Information</h3>
                    <div className="space-y-4">
                      <div id="school_name">
                        <SchoolSearchInput
                          value={editFormData.school_name}
                          required
                          error={errors2.school_name}
                          placeholder="School name"
                          onChange={(v) => setEditFormData({ ...editFormData, school_name: v, school_id: null })}
                          onSelect={(school) => setEditFormData({
                            ...editFormData,
                            school_name: school.school_name,
                            school_address: `${school.street_address}, ${school.city}, ${school.state}, ${school.zipcode}`,
                            school_id: school.id,
                          })}
                        />
                      </div>
                      <div id="school_address">
                        <FieldLabel required>School Address</FieldLabel>
                        <TextInput

                          value={editFormData.school_address}
                          onChange={(v) => setEditFormData({ ...editFormData, school_address: v })}
                          placeholder="School address"
                          error={errors2.school_address}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>School Phone</FieldLabel>
                          <TextInput
                            value={editFormData.school_phone}
                            onChange={(v) => setEditFormData({ ...editFormData, school_phone: v })}
                            placeholder="Phone"
                          />
                        </div>
                        <div>
                          <FieldLabel>School Email</FieldLabel>
                          <TextInput
                            value={editFormData.school_email}
                            onChange={(v) => setEditFormData({ ...editFormData, school_email: v })}
                            placeholder="Email"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E8E8E8]" />

                  <div>
                    <h3 className="text-[#121212] font-inter text-base font-bold mb-4">Teacher Information</h3>
                    <div className="space-y-4">
                      <div>
                        <TeacherSearchInput
                          value={editFormData.teacher_name}
                          schoolId={editFormData.school_id}
                          label="Teacher Name"
                          placeholder="Teacher name"
                          onChange={(v) => setEditFormData({ ...editFormData, teacher_name: v, teacher_id: null })}
                          onSelect={(teacher) => setEditFormData({
                            ...editFormData,
                            teacher_name: teacher.name,
                            teacher_id: teacher.id,
                          })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Teacher Phone</FieldLabel>
                          <TextInput
                            value={editFormData.teacher_phone}
                            onChange={(v) => setEditFormData({ ...editFormData, teacher_phone: v })}
                            placeholder="Phone"
                          />
                        </div>
                        <div>
                          <FieldLabel>Teacher Email</FieldLabel>
                          <TextInput
                            value={editFormData.teacher_email}
                            onChange={(v) => setEditFormData({ ...editFormData, teacher_email: v })}
                            placeholder="Email"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Add notes..."
                      rows={4}
                      className="w-full bg-[#F5F6FA] border-0 rounded-lg px-4 py-3 text-sm font-inter text-[#121212] placeholder:text-[#ADADAD] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all resize-none"
                    />
                  </div>

                  {errors2.submit && (
                    <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {errors2.submit}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditingEvent(false)}
                      disabled={isSavingEvent}
                      className="flex-1 py-3 rounded-xl border border-[#E2E2E2] text-[#121212] font-inter text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEventChanges}
                      disabled={isSavingEvent}
                      className="flex-1 py-3 rounded-xl bg-[#0171F9] text-white font-inter text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSavingEvent ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      title="Delete"
                      className="py-2 px-3 rounded-xl border border-red-300 text-red-600 font-inter text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
