"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, startOfDay, isBefore } from "date-fns";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PageLoader from "@/app/components/PageLoader";
import "./calendar.css";
import { CalendarIcon } from "@/lib/icons";
import { formatDateTimeLocal, getRandomEventColors, scrollToFirstError } from "@/lib/function";

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

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[#0171F9]">{icon}</span>
      <h3 className="text-[#121212] font-inter text-base font-bold">{title}</h3>
    </div>
  );
}

function SelectedDayCard({ date, events }: { date: Date; events: CalendarEvent[] }) {
  const dayLabel = format(date, "EEE, MMM d, yyyy");

  return (
    <div className="rounded-2xl border border-[#F0F0F0] bg-white overflow-hidden">
      <div className="border-b border-[#F0F0F0] px-4 py-4">
        <h3 className="text-[#121212] font-inter text-base font-bold">{dayLabel}</h3>
      </div>
      {events.length === 0 ? (
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
      )}
    </div>
  );
}

function UpcomingJobsCard({ events }: { events: CalendarEvent[] }) {
  const now = startOfDay(new Date());

  const upcoming = events
    .filter((e) => !isBefore(startOfDay(e.start), now))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-[#F0F0F0] bg-white overflow-hidden">
      <div className="border-b border-[#F0F0F0] bg-white px-4 py-4 rounded-t-2xl">
        <h3 className="text-[#121212] font-inter text-base font-bold">Upcoming Jobs</h3>
      </div>
      {upcoming.length === 0 ? (
        <div className="px-4 py-6 text-center text-[#9A9A9A] font-inter text-sm">
          No upcoming jobs
        </div>
      ) : (
        upcoming.map((event, idx) => (
          <div
            key={event.id}
            className={`px-4 py-4 ${idx < upcoming.length - 1 ? "border-b border-[#F0F0F0]" : ""} bg-white`}
          >
            <div className="flex items-start gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[#121212] font-inter text-sm font-semibold leading-snug">
                  {event.title}
                </span>
                <span className="text-[#9A9A9A] font-inter text-xs font-medium">
                  {format(event.start, "EEE MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AddEventSidebar({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void
}) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("15:00");
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
  const dateRef1 = useRef<HTMLInputElement>(null);
  const dateRef2 = useRef<HTMLInputElement>(null);
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [schoolSearchLoading, setSchoolSearchLoading] = useState(false);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [teacherSuggestions, setTeacherSuggestions] = useState<string[]>([]);
  const [teacherSearchLoading, setTeacherSearchLoading] = useState(false);
  const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const formRef1 = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");

  useEffect(() => {
    scrollToFirstError(errors, formRef1);
  }, [errors]);

  const reset = () => {
    setStartDate(today); setEndDate(today);
    setStartTime("08:00"); setEndTime("15:00");
    setSchoolName(""); setSchoolAddress("");
    setSchoolPhone(""); setSchoolEmail("");
    setTeacherName(""); setTeacherPhone(""); setTeacherEmail("");
    setNotes("");
    setTitle("");
    setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!startDate.trim()) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate.trim()) {
      newErrors.endDate = "End date is required";
    }

    if (!startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!endTime) {
      newErrors.endTime = "End time is required";
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      newErrors.endTime = "End time must be after start time";
    }

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
    console.log("newErrors", newErrors)
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
      const [sy, sm, sd] = startDate.split("-").map(Number);
      const [sh, smin] = startTime.split(":").map(Number);
      const [ey, em, ed] = endDate.split("-").map(Number);
      const [eh, emin] = endTime.split(":").map(Number);
      const eventColors = getRandomEventColors();


      const eventData = {
        title: title,
        start: new Date(sy, sm - 1, sd, sh, smin).toISOString(),
        end: new Date(ey, em - 1, ed, eh, emin).toISOString(),
        school: schoolName,
        schoolAddress,
        schoolPhone: schoolPhone.trim() || null,
        schoolEmail: schoolEmail.trim() || null,
        schoolId: schoolId || null,
        teacherName: teacherName.trim() || null,
        teacherId: teacherId || null,
        teacherPhone: teacherPhone.trim() || null,
        teacherEmail: teacherEmail.trim() || null,
        notes: notes.trim() || null,
        ...eventColors,
        reminders: 0,
        user_id: session?.user?.id
      };

      const response = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save event");
      }
      const data = await response.json();
      const startDate1 = new Date(eventData.start);
      const endDate1 = new Date(eventData.end);

      onSave({
        id: data.event.id,
        title: eventData.title,
        start: startDate1,
        end: endDate1,
        school: schoolName,
        school_name: schoolName,
        ...eventColors,
        reminders: 0,
        user_id: session?.user?.id
      });

      reset();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save event";
      setErrors({ submit: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSchools = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSchoolSuggestions([]);
      return;
    }

    try {
      setSchoolSearchLoading(true);
      const response = await fetch(`/api/schoolSearch?search=${encodeURIComponent(query)}`);

      if (response.ok) {
        const data = await response.json();
        setSchoolSuggestions(Array.isArray(data) ? data : data.schools || []);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      setSchoolSuggestions([]);
    } finally {
      setSchoolSearchLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async (query: string, schoolId: number) => {
    if (!query.trim()) {
      setTeacherSuggestions([]);
      return;
    }

    try {
      setTeacherSearchLoading(true);
      const response = await fetch(`/api/teachers?search=${encodeURIComponent(query)}&school_id=${schoolId}`);

      if (response.ok) {
        const data = await response.json();
        setTeacherSuggestions(Array.isArray(data) ? data : data.teachers || []);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeacherSuggestions([]);
    } finally {
      setTeacherSearchLoading(false);
    }
  }, []);

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
          <div>
            <SectionHeader
              title="Job / Event Details"
              icon={
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.049 1.99292H9.36599C8.85085 1.99292 8.38254 2.19222 8.02797 2.51109C7.6734 2.19222 7.20509 1.99292 6.68995 1.99292H2.0069C1.63894 1.99292 1.33789 2.29187 1.33789 2.65725V12.6221C1.33789 12.9875 1.63894 13.2865 2.0069 13.2865H5.86038C6.21496 13.2865 6.55615 13.426 6.80369 13.6784L7.55298 14.4224C7.55298 14.4224 7.56636 14.4291 7.57305 14.4357C7.63326 14.4889 7.69347 14.5354 7.76706 14.5686C7.84734 14.6018 7.93431 14.6217 8.02128 14.6217C8.10825 14.6217 8.19522 14.6018 8.2755 14.5686C8.34909 14.5354 8.416 14.4889 8.46952 14.4357C8.46952 14.4357 8.4829 14.4291 8.48959 14.4224L9.23888 13.6784C9.48641 13.4326 9.83429 13.2865 10.1822 13.2865H14.0357C14.4036 13.2865 14.7047 12.9875 14.7047 12.6221V2.65725C14.7047 2.29187 14.4036 1.99292 14.0357 1.99292H14.049ZM5.86038 11.9578H2.67591V3.32157H6.68995C7.05791 3.32157 7.35896 3.62052 7.35896 3.9859V12.4162C6.91742 12.1239 6.39559 11.9578 5.86038 11.9578ZM13.38 11.9578H10.1956C9.66035 11.9578 9.13852 12.1239 8.69698 12.4162V3.9859C8.69698 3.62052 8.99803 3.32157 9.36599 3.32157H13.38V11.9578Z" fill="#0171F9" />
                </svg>
              }
            />
            <hr className="border-[#E8E8E8] mb-[30px]" />
          </div>
          <div className="flex flex-col gap-4" >
            <div className="relative">
              <FieldLabel required>Title</FieldLabel>
              <TextInput
                value={title}
                id="title"
                onChange={(value: string) => {
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
            <div className="grid grid-cols-2 gap-4">
              <div >
                <FieldLabel required>Start Date</FieldLabel>
                <div onClick={() => dateRef1.current?.showPicker()} className={`flex items-center text-sm gap-[6px] px-4 rounded-lg overflow-hidden justify-between py-[14px] ${errors.startDate ? "bg-red-50 border border-red-500" : "bg-[#F3F4F5]"}`}>
                  <input
                    type="date"
                    id="startDate"
                    // max={endDate}
                    ref={dateRef1}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent outline-none w-full font-inter text-sm text-[#121212] appearance-none"
                  />
                  <div className="cursor-pointer">
                    <CalendarIcon />
                  </div>
                </div>
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div >
                <FieldLabel required>End Date</FieldLabel>
                <div onClick={() => dateRef2.current?.showPicker()} className={`flex items-center text-sm gap-[6px] px-4 rounded-lg overflow-hidden justify-between py-[14px] ${errors.endDate ? "bg-red-50 border border-red-500" : "bg-[#F3F4F5]"}`}>
                  <input
                    type="date"
                    ref={dateRef2}
                    id="endDate"
                    // min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent outline-none w-full font-inter text-sm text-[#121212] appearance-none"
                  />
                  <div className="cursor-pointer">
                    <CalendarIcon />
                  </div>
                </div>
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <FieldLabel required>Start Time</FieldLabel>
                <div>
                  <input
                    type="time"
                    value={startTime}
                    id="startTime"
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 transition-all ${errors.startTime ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                      }`}
                  />
                </div>
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
              </div>
              <div>
                <FieldLabel required>End Time</FieldLabel>
                <div>
                  <input
                    type="time"
                    value={endTime}
                    id="endTime"
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 transition-all ${errors.endTime ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                      }`}
                  />
                </div>
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>
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
              <div className="relative">
                <FieldLabel required>School Name</FieldLabel>
                <TextInput
                  value={schoolName}
                  id="schoolName"
                  onChange={(value: string) => {
                    setSchoolName(value);
                    fetchSchools(value);
                    setSchoolId("");
                    setShowSchoolSuggestions(true);
                  }}
                  placeholder="e.g. Lincoln High School"
                  error={errors.schoolName}
                />
                {showSchoolSuggestions && (schoolSuggestions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {schoolSearchLoading && (
                      <div className="px-4 py-3 text-center text-sm text-[#6B7280]">Searching...</div>
                    )}
                    {!schoolSearchLoading && schoolSuggestions.length > 0 && (
                      schoolSuggestions.map((school: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSchoolAddress(`${school.street_address}, ${school.city}, ${school.state}, ${school.zipcode}`);
                            setSchoolName(school.school_name);
                            setSchoolId(school.id);
                            setShowSchoolSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F3F4F5] font-inter text-sm text-[#121212] border-b border-[#E0E0E2] last:border-b-0 transition-colors"
                        >
                          {school.school_name}
                        </button>
                      ))
                    )}
                    {!schoolSearchLoading && schoolSuggestions.length === 0 && (
                      <div className="px-4 py-3 text-center text-sm text-[#6B7280]">No schools found</div>
                    )}
                  </div>
                )}
              </div>
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
              title="Regular Teacher's Info"
              icon={
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3.5" stroke="#0171F9" strokeWidth="1.5" />
                  <path d="M2 16.5C2 13.4624 5.13401 11 9 11C12.866 11 16 13.4624 16 16.5" stroke="#0171F9" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            <div className="flex flex-col gap-4">
              <div className="relative">
                <FieldLabel>Teacher's Full Name</FieldLabel>
                <TextInput
                  value={teacherName}
                  onChange={(value: string) => {
                    setTeacherName(value);
                    setTeacherId("");
                    setShowTeacherSuggestions(true);
                    fetchTeachers(value, schoolId);
                  }}
                  placeholder="e.g. Maria Gonzalez"
                />
                {showTeacherSuggestions && (teacherSuggestions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {teacherSearchLoading && (
                      <div className="px-4 py-3 text-center text-sm text-[#6B7280]">Searching...</div>
                    )}
                    {!teacherSearchLoading && teacherSuggestions.length > 0 && (
                      teacherSuggestions.map((teacher: any, idx1: number) => (
                        <button
                          key={idx1}
                          type="button"
                          onMouseDown={() => {
                            setTeacherName(teacher.name);
                            setTeacherId(teacher.id);
                            setShowTeacherSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F3F4F5] font-inter text-sm text-[#121212] border-b border-[#E0E0E2] last:border-b-0 transition-colors"
                        >
                          {teacher.name}
                        </button>
                      ))
                    )}
                    {!teacherSearchLoading && teacherSuggestions.length === 0 && teacherName.trim() && (
                      <div className="px-4 py-3 text-center text-sm text-[#6B7280]">No teachers found</div>
                    )}
                  </div>
                )}
              </div>
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "guest_teacher") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "guest_teacher") {
      fetchEvents();
    }
  }, [status]);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch("/api/calendar-events/get");
      if (response.ok) {
        const data = await response.json();

        setEvents(
          data.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const selectedDayEvents = events.filter((e) => {
    const eStart = new Date(e.start);
    const eEnd = new Date(e.end);
    const selected = new Date(selectedDay);
    selected.setHours(0, 0, 0, 0);
    eStart.setHours(0, 0, 0, 0);
    eEnd.setHours(0, 0, 0, 0);
    return (eStart <= selected && selected <= eEnd);
  });

  const handleAddEvent = (eventData: CalendarEvent) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: eventData.id,
    };
    setEvents((prev) => [...prev, newEvent]);
    setSelectedDay(newEvent.start);
    setCurrentDate(newEvent.start);
  };

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [errors2, setErrors2] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const handleSelectEvent = async (info: any) => {
    setSelectedDay(new Date(info.event.start));
    setErrors2({});
    const eventId = info.event.id;
    try {
      const response = await fetch(`/api/calendar-events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        const event = data.event;
        setSelectedEvent(event);
        setEditFormData({
          title: event.title || "",
          start_date: event.start_date || "",
          end_date: event.end_date || "",
          school_name: event.school_name || "",
          school_address: event.school_address || "",
          school_phone: event.school_phone || "",
          school_email: event.school_email || "",
          teacher_name: event.teacher_name || "",
          teacher_phone: event.teacher_phone || "",
          teacher_email: event.teacher_email || "",
          notes: event.notes || "",
        });
      } else {
        console.error("Failed to fetch event:", response.status);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleSelectDate = (info: any) => {
    setSelectedDay(new Date(info.dateStr));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!editFormData.start_date.trim()) {
      newErrors.start_date = "Start date is required";
    }

    if (!editFormData.end_date.trim()) {
      newErrors.end_date = "End date is required";
    }

    if ((editFormData.start_date && editFormData.end_date) && editFormData.end_date <= editFormData.start_date) {
      newErrors.end_date = "End time must be after start time";
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
      const response = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      const updatedEvent = await response.json();
      setErrors2({});
      setIsEditingEvent(false);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.event.id
            ? {
              ...updatedEvent.event,
              start: new Date(updatedEvent.event.start_date),
              end: new Date(updatedEvent.event.end_date),
              bgColor: updatedEvent.event.bg_color,
              borderColor: updatedEvent.event.bg_color,
              textColor: updatedEvent.event.color,
              color: updatedEvent.event.color,
            }
            : event
        )
      );
      setSelectedEvent(updatedEvent.event);
    } catch (error) {
      console.error("Error saving event:", error);
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
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
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
            {!isLoadingEvents ? <span className="px-2 py-1 rounded bg-[#DFEEFF] text-[#0171F9] font-inter text-xs font-semibold">
              {totalEvents} Events
            </span> : ""}
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-[#0171F9] text-white font-inter text-sm sm:text-base font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9.99822 3.33301C10.2192 3.33301 10.4312 3.4208 10.5874 3.57707C10.7437 3.73334 10.8315 3.94528 10.8315 4.16628V9.16593H15.8311C16.0521 9.16593 16.2641 9.25372 16.4204 9.40999C16.5766 9.56626 16.6644 9.7782 16.6644 9.9992C16.6644 10.2202 16.5766 10.4321 16.4204 10.5884C16.2641 10.7447 16.0521 10.8325 15.8311 10.8325H10.8315V15.8321C10.8315 16.0531 10.7437 16.2651 10.5874 16.4213C10.4312 16.5776 10.2192 16.6654 9.99822 16.6654C9.77723 16.6654 9.56528 16.5776 9.40901 16.4213C9.25274 16.2651 9.16495 16.0531 9.16495 15.8321V10.8325H4.16531C3.94431 10.8325 3.73236 10.7447 3.57609 10.5884C3.41982 10.4321 3.33203 10.2202 3.33203 9.9992C3.33203 9.7782 3.41982 9.56626 3.57609 9.40999C3.73236 9.25372 3.94431 9.16593 4.16531 9.16593H9.16495V4.16628C9.16495 3.94528 9.25274 3.73334 9.40901 3.57707C9.56528 3.4208 9.77723 3.33301 9.99822 3.33301Z" fill="white" />
            </svg>
            Add Job / Event
          </button>
        </div>
        {(isLoadingEvents) ? <PageLoader message="Loading Calendar..." className="min-h-[600px] flex items-center justify-center bg-[#F8FAFE]" /> : ""}
        {!isLoadingEvents ? <div className="flex flex-col xl:flex-row gap-6">
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
              height="auto"
              contentHeight="auto"
              events={fullCalendarEvents}
              dateClick={handleSelectDate}
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
            <SelectedDayCard date={selectedDay} events={selectedDayEvents} />
            <UpcomingJobsCard events={events} />
          </div>
        </div> : ""}
      </main>

      <Footer />

      <AddEventSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSave={handleAddEvent}
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

            <div className="p-6 space-y-6" ref={formRef}>
              {!isEditingEvent ? (
                <>
                  <div>
                    {/* <h3 className="text-[#121212] font-inter text-base font-bold mb-4">Event Information</h3> */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[#9A9A9A] font-inter text-sm font-medium">Title</label>
                        <p className="text-[#121212] font-inter text-base mt-1">{selectedEvent.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">Start Date</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{format(new Date(selectedEvent.start_date), "MMM d, yyyy h:mm aa")}</p>
                        </div>
                        <div>
                          <label className="text-[#9A9A9A] font-inter text-sm font-medium">End Date</label>
                          <p className="text-[#121212] font-inter text-base mt-1">{format(new Date(selectedEvent.end_date), "MMM d, yyyy h:mm aa")}</p>
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
                    <FieldLabel required>Title</FieldLabel>
                    <TextInput
                      value={editFormData.title}
                      id="title"
                      onChange={(v) => setEditFormData({ ...editFormData, title: v })}
                      placeholder="Event title"
                      error={errors2.title}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div id="start_date">
                      <FieldLabel required>Start Date</FieldLabel>
                      <input

                        type="datetime-local"
                        value={
                          editFormData.start_date
                            ? formatDateTimeLocal(editFormData.start_date)
                            : ""
                        }
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            start_date: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "",
                          })
                        }
                        className={`w-full bg-[#F5F6FA] border-0 rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all ${errors2.start_date ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"
                          }`}
                      />
                      {errors2.start_date && <p className="text-red-500 text-xs mt-1">{errors2.start_date}</p>}


                    </div>
                    <div id="end_date">
                      <FieldLabel required>End Date</FieldLabel>
                      <input

                        type="datetime-local"
                        value={
                          editFormData.end_date
                            ? formatDateTimeLocal(editFormData.end_date)
                            : ""
                        }
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            end_date: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "",
                          })
                        }

                        className={`w-full bg-[#F5F6FA] border-0 rounded-lg px-4 py-3 text-sm font-inter text-[#121212] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all ${errors2.start_date ? "bg-red-50 border border-red-500 focus:ring-red-200" : "bg-[#F5F6FA] border-0 focus:ring-[#0171F9]/30"}`}
                      />
                      {errors2.end_date && <p className="text-red-500 text-xs mt-1">{errors2.end_date}</p>}
                    </div>
                  </div>

                  <hr className="border-[#E8E8E8]" />

                  <div>
                    <h3 className="text-[#121212] font-inter text-base font-bold mb-4">School Information</h3>
                    <div className="space-y-4">
                      <div id="school_name">
                        <FieldLabel required>School Name</FieldLabel>
                        <TextInput
                          value={editFormData.school_name}

                          onChange={(v) => setEditFormData({ ...editFormData, school_name: v })}
                          placeholder="School name"
                          error={errors2.school_name}
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
                        <FieldLabel>Teacher Name</FieldLabel>
                        <TextInput
                          value={editFormData.teacher_name}
                          onChange={(v) => setEditFormData({ ...editFormData, teacher_name: v })}
                          placeholder="Teacher name"
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

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditingEvent(false)}
                      className="flex-1 py-3 rounded-xl border border-[#E2E2E2] text-[#121212] font-inter text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
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
