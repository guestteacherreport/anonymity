"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { scrollToError } from "@/lib/function";


type Association = "School District" | "Private" | "Charter";
type SchoolYear = "2025-2026" | "2026-2027" | "2027-2028" | "2028-2029";
type GradeLevel = "Pre-K" | "Elementary" | "Middle School" | "High School" | "Special Ed";


interface SchoolFormData {
    name: string;
    association: any;
    districtName: string;
    schoolYear: any;
    gradeLevels: GradeLevel[];
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
}

const GRADE_LEVELS: GradeLevel[] = ["Pre-K", "Elementary", "Middle School", "High School", "Special Ed"];
const ASSOCIATIONS: Association[] = ["School District", "Private", "Charter"];


export default function SchoolEditForm() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const params = useParams();
    const schoolId = params.id as string;
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    const SCHOOL_YEARS: SchoolYear[] = Array.from({ length: 5 }, (_, i) => {
    const startYear = currentYear - 5 + i;
    return `${startYear}-${startYear + 1}`;
    }) as SchoolYear[];
    const [form, setForm] = useState<SchoolFormData>({
        name: "",
        association: "",
        districtName: "",
        schoolYear: "",
        gradeLevels: [],
        streetAddress: "",
        city: "",
        state: "",
        zip: "",
    });

    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                setPageLoading(true);
                const response = await fetch(`/api/schools/${schoolId}`);
                const data = await response.json();

                if (data.success && data.school) {
                    const school = data.school;
                    setForm({
                        name: school.school_name || "",
                        association: school.school_association || "",
                        districtName: school.school_district_name || "",
                        schoolYear: school.school_year || "",
                        gradeLevels: school.grade_level ? school.grade_level : [],
                        streetAddress: school.street_address || "",
                        city: school.city || "",
                        state: school.state || "",
                        zip: school.zipcode || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching school data:", error);
                toast.error("Failed to load school data");
            } finally {
                setPageLoading(false);
            }
        };

        if (schoolId) {
            fetchSchoolData();
        }
    }, [schoolId]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            newErrors.name = "School name is required";
        }
        if (
            !form.association
        ) {
            newErrors.association = "School disctrict/association is required";
        }
        if (
            !form.schoolYear
        ) {
            newErrors.schoolYear = "School year is required";
        }
        if (
            form.association === "School District" &&
            !form.districtName.trim()
        ) {
            newErrors.districtName = "District name is required";
        }

        if (form.gradeLevels.length === 0) {
            newErrors.gradeLevels = "Please select at least one grade level";
        }

        if (!form.streetAddress.trim()) {
            newErrors.streetAddress = "Street address is required";
        }

        if (!form.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!form.state.trim()) {
            newErrors.state = "State is required";
        }

        if (!form.zip.trim()) {
            newErrors.zip = "ZIP code is required";
        }

        setErrors(newErrors);

        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validateForm();
                setErrors(validationErrors);
        
                if (Object.keys(validationErrors).length > 0) {
                    scrollToError(validationErrors);
                    return;
                }

        try {
            setLoading(true);

            const response = await fetch(`/api/school/edit/${schoolId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();
           
            if (!response.ok) {
                toast.error(data.message || "Failed to edit school");
                return;
            }

            toast.success("School edited successfully");

            router.push(`/admin/schools/${schoolId}`);

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleGradeLevel = (grade: GradeLevel) => {
        setForm((prev) => ({
            ...prev,
            gradeLevels: prev.gradeLevels.includes(grade)
                ? prev.gradeLevels.filter((g) => g !== grade)
                : [...prev.gradeLevels, grade],
        }));
    };


    if (pageLoading) {
        return (
            <div className="flex-1 overflow-y-auto flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#0171F9] rounded-full animate-spin" />
                    <p className="font-inter text-[#6B7280]">Loading school data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Page-level top bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-[26px]">
                <Link href="/admin/schools" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div
                        className="flex items-center justify-center cursor-pointer flex-shrink-0"
                        aria-label="Go back"
                    >
                        <svg width="20" height="14" viewBox="0 0 24 16" fill="none" className="sm:w-6 sm:h-4">
                            <path d="M3.49202 9.04802L8.52603 14.2183C8.7315 14.4294 8.83013 14.6756 8.82191 14.9569C8.81369 15.2383 8.7065 15.4845 8.50035 15.6955C8.29488 15.889 8.05516 15.9903 7.7812 15.9994C7.50724 16.0086 7.26753 15.9073 7.06206 15.6955L0.281557 8.73147C0.178822 8.62596 0.10588 8.51165 0.0627314 8.38854C0.0195827 8.26544 -0.00130658 8.13355 6.32218e-05 7.99286C0.00143302 7.85217 0.0230071 7.72027 0.0647859 7.59717C0.106565 7.47407 0.179165 7.35976 0.282584 7.25424L7.06309 0.290169C7.25143 0.0967228 7.48704 0 7.7699 0C8.05277 0 8.29659 0.0967228 8.50138 0.290169C8.70685 0.501202 8.80958 0.751979 8.80958 1.0425C8.80958 1.33302 8.70685 1.58345 8.50138 1.79378L3.49202 6.9377H22.9726C23.2637 6.9377 23.5079 7.03899 23.7051 7.24158C23.9024 7.44417 24.0007 7.6946 24 7.99286C23.9993 8.29112 23.9007 8.54189 23.7041 8.74519C23.5076 8.94848 23.2637 9.04943 22.9726 9.04802H3.49202Z" fill="#1E1E1E" />
                        </svg>
                    </div>
                    <h1 className="font-outfit font-semibold text-lg sm:text-2xl lg:text-3xl text-[#121212] leading-tight truncate">School</h1>
                </Link>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <Link
                        href={`/admin/schools/${schoolId}`}
                        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#EFF0F2] bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M9.99967 11.1668L5.91634 15.2502C5.76356 15.4029 5.56912 15.4793 5.33301 15.4793C5.0969 15.4793 4.90245 15.4029 4.74967 15.2502C4.5969 15.0974 4.52051 14.9029 4.52051 14.6668C4.52051 14.4307 4.5969 14.2363 4.74967 14.0835L8.83301 10.0002L4.74967 5.91683C4.5969 5.76405 4.52051 5.56961 4.52051 5.3335C4.52051 5.09738 4.5969 4.90294 4.74967 4.75016C4.90245 4.59738 5.0969 4.521 5.33301 4.521C5.56912 4.521 5.76356 4.59738 5.91634 4.75016L9.99967 8.8335L14.083 4.75016C14.2358 4.59738 14.4302 4.521 14.6663 4.521C14.9025 4.521 15.0969 4.59738 15.2497 4.75016C15.4025 4.90294 15.4788 5.09738 15.4788 5.3335C15.4788 5.56961 15.4025 5.76405 15.2497 5.91683L11.1663 10.0002L15.2497 14.0835C15.4025 14.2363 15.4788 14.4307 15.4788 14.6668C15.4788 14.9029 15.4025 15.0974 15.2497 15.2502C15.0969 15.4029 14.9025 15.4793 14.6663 15.4793C14.4302 15.4793 14.2358 15.4029 14.083 15.2502L9.99967 11.1668Z" fill="#333333" />
                        </svg>
                        <span className="hidden sm:inline font-inter font-medium text-sm sm:text-base text-[#333]">Cancel</span>
                    </Link>

                     <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg bg-[#0171F9] cursor-pointer hover:bg-[#0161d9] transition-colors disabled:opacity-50"
                        >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="sm:w-5 sm:h-5 flex-shrink-0">
                            <path d="M2.5 4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H13.8217C14.2637 2.50009 14.6875 2.67575 15 2.98833L17.2558 5.24417C17.4121 5.40041 17.5 5.61234 17.5 5.83333V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667ZM7.5 15.8333H12.5V10.8333H7.5V15.8333ZM14.1667 15.8333H15.8333V6.17833L14.1667 4.51167V5.83333C14.1667 6.27536 13.9911 6.69928 13.6785 7.01184C13.3659 7.3244 12.942 7.5 12.5 7.5H7.5C7.05797 7.5 6.63405 7.3244 6.32149 7.01184C6.00893 6.69928 5.83333 6.27536 5.83333 5.83333V4.16667H4.16667V15.8333H5.83333V10.8333C5.83333 10.3913 6.00893 9.96738 6.32149 9.65482C6.63405 9.34226 7.05797 9.16667 7.5 9.16667H12.5C12.942 9.16667 13.3659 9.34226 13.6785 9.65482C13.9911 9.96738 14.1667 10.3913 14.1667 10.8333V15.8333ZM7.5 4.16667V5.83333H12.5V4.16667H7.5Z" fill="white" />
                        </svg>

                            <span className="hidden sm:inline font-inter font-semibold text-sm sm:text-base text-white">
                                {loading ? "Saving..." : "Save"}
                            </span>
                        </button>

                   
                </div>
            </div>

            {/* Form Card */}
            <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-[720px] mx-auto flex flex-col gap-6 sm:gap-8 lg:gap-10">

                    {/* ── School Details ── */}
                    <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8">
                        <h2 className="font-outfit font-semibold text-xl sm:text-2xl lg:text-2xl text-[#0171F9]">School Details</h2>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* School Name */}
                            <div className="flex flex-col gap-2 sm:gap-2.5">
                                <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">School Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter School Name"
                                    value={form.name}
                                    id="name"
                                    onChange={(e) => {

                                        setForm({ ...form, name: e.target.value })
                                        setErrors((prev) => ({
                                            ...prev,
                                            name: "",
                                        }));
                                    }}
                                    className="h-10 sm:h-[43px] px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* School District / Association */}
                            <div className="flex flex-col gap-2 sm:gap-2.5" id="association">
                                <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">School Disctrict/Association</label>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    {ASSOCIATIONS.map((assoc) => (
                                        <button
                                            key={assoc}
                                            onClick={() => {setForm({ ...form, association: assoc })
                                            setErrors((prev) => ({
                                                    ...prev,
                                                    association: "",
                                                }));
                                        }}
                                            className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg border font-inter text-xs sm:text-sm font-medium transition-all cursor-pointer ${form.association === assoc
                                                ? "border-[#0B77F9] bg-[#DBECFF] text-[#0B77F9]"
                                                : "border-[#B2B2B2] bg-[#FCFDFE] text-[#121212]"
                                                }`}
                                        >
                                            {assoc}
                                        </button>

                                    ))}
                                    
                                </div>
                                {errors.association && (
                                        <p className="text-red-500 text-xs">
                                            {errors.association}
                                        </p>
                                    )}
                                {form.association === "School District" && (
                                    <input
                                        type="text"
                                        id="districtName"
                                        placeholder="Enter School Disctrict Name"
                                        value={form.districtName}
                                        onChange={(e) => {
                                            setForm({ ...form, districtName: e.target.value })
                                            setErrors((prev) => ({
                                                ...prev,
                                                districtName: "",
                                            }));
                                        }}
                                        className="h-10 sm:h-[43px] px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all"
                                    />
                                )}
                                {errors.districtName && (
                                    <p className="text-red-500 text-xs">
                                        {errors.districtName}
                                    </p>
                                )}
                            </div>

                            {/* School Year */}
                            <div className="flex flex-col gap-2 sm:gap-2.5" id="schoolYear">
                                <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">School Year</label>
                                <p className="font-inter text-xs sm:text-sm text-[#6B7280] -mt-1">
                                    Each school year creates a new record. Regular teachers often transfer between years, changing a school's dynamics.
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    {SCHOOL_YEARS.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setForm({ ...form, schoolYear: year })
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    schoolYear: "",
                                                }));
                                            }}
                                            className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg border font-inter text-xs sm:text-sm font-medium transition-all cursor-pointer ${form.schoolYear === year
                                                ? "border-[#0B77F9] bg-[#DBECFF] text-[#0B77F9]"
                                                : "border-[#B2B2B2] bg-[#FCFDFE] text-[#121212]"
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                    {errors.schoolYear && (
                                        <p className="text-red-500 text-xs ">
                                            {errors.schoolYear}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Grade Level */}
                            <div className="flex flex-col gap-2 sm:gap-2.5" id="gradeLevels">
                                <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">Grade Level supported</label>
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    {GRADE_LEVELS.map((grade) => {
                                        const selected = form.gradeLevels.includes(grade);
                                        return (
                                            <button
                                                key={grade}
                                                onClick={() => {
                                                    toggleGradeLevel(grade)
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        gradeLevels: "",
                                                    }));
                                                }}
                                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-all cursor-pointer ${selected
                                                    ? "bg-[#0B77F9] text-white"
                                                    : "border border-[#B2B2B2] bg-[#FCFDFE] text-[#121212]"
                                                    }`}
                                            >
                                                {grade}
                                                {selected && (
                                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="flex-shrink-0">
                                                        <path d="M4.38333 5.31667L1.11667 8.58333C0.994444 8.70555 0.838889 8.76667 0.65 8.76667C0.461111 8.76667 0.305555 8.70555 0.183333 8.58333C0.0611109 8.46111 0 8.30556 0 8.11667C0 7.92778 0.0611109 7.77222 0.183333 7.65L3.45 4.38333L0.183333 1.11667C0.0611109 0.994444 0 0.838889 0 0.65C0 0.461111 0.0611109 0.305555 0.183333 0.183333C0.305555 0.0611109 0.461111 0 0.65 0C0.838889 0 0.994444 0.0611109 1.11667 0.183333L4.38333 3.45L7.65 0.183333C7.77222 0.0611109 7.92778 0 8.11667 0C8.30556 0 8.46111 0.0611109 8.58333 0.183333C8.70555 0.305555 8.76667 0.461111 8.76667 0.65C8.76667 0.838889 8.70555 0.994444 8.58333 1.11667L5.31667 4.38333L8.58333 7.65C8.70555 7.77222 8.76667 7.92778 8.76667 8.11667C8.76667 8.30556 8.70555 8.46111 8.58333 8.58333C8.46111 8.70555 8.30556 8.76667 8.11667 8.76667C7.92778 8.76667 7.77222 8.70555 7.65 8.58333L4.38333 5.31667Z" fill="white" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}

                                </div>
                            </div>
                            {errors.gradeLevels && (
                                <p className="text-red-500 text-xs">
                                    {errors.gradeLevels}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-black opacity-10" />

                    {/* ── School Address ── */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <h2 className="font-outfit font-semibold text-xl sm:text-2xl lg:text-2xl text-[#0171F9]">School Address</h2>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Street Address */}
                            <div className="flex flex-col gap-2 sm:gap-2.5">
                                <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">Street Address</label>
                                <div className="flex items-center justify-between h-10 sm:h-[43px] px-3 sm:px-4 rounded-lg bg-[#F3F4F5] overflow-hidden">
                                    <input
                                        type="text"
                                        id="streetAddress"
                                        placeholder="Enter Street Address"
                                        value={form.streetAddress}
                                        onChange={(e) => {
                                            setForm({ ...form, streetAddress: e.target.value })
                                            setErrors((prev) => ({
                                                ...prev,
                                                streetAddress: "",
                                            }));
                                        }}
                                        className="flex-1 bg-transparent font-inter text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none"
                                    />
                                    {/* <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60 flex-shrink-0 sm:w-4 sm:h-4">
                                        <g clipPath="url(#clip_chevron_down)">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M8.47136 10.4712C8.34634 10.5962 8.1768 10.6664 8.00003 10.6664C7.82325 10.6664 7.65371 10.5962 7.52869 10.4712L3.75736 6.6999C3.63244 6.57488 3.5625 6.40534 3.5625 6.22857C3.5625 6.0518 3.63244 5.88226 3.75736 5.75724C3.88238 5.63232 4.05192 5.56238 4.22869 5.56238C4.40546 5.56238 4.575 5.63232 4.70003 5.75724L8.00003 9.05724L11.3 5.75724C11.4258 5.6358 11.5942 5.5686 11.769 5.57012C11.9438 5.57164 12.111 5.64175 12.2346 5.76536C12.3582 5.88896 12.4283 6.05617 12.4298 6.23097C12.4313 6.40577 12.3641 6.57417 12.2427 6.6999L8.47136 10.4712Z" fill="#1E1E1E" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip_chevron_down"><rect width="16" height="16" fill="white" /></clipPath>
                                        </defs>
                                    </svg> */}
                                </div>
                                {errors.streetAddress && (
                                    <p className="text-red-500 text-xs">
                                        {errors.streetAddress}
                                    </p>
                                )}
                            </div>

                            {/* City / State / Zip */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="flex flex-col gap-2 sm:gap-2.5">
                                    <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">City</label>
                                    <input
                                        type="text"
                                        placeholder="Enter City Name"
                                        id="city"
                                        value={form.city}
                                        onChange={(e) => {
                                            setForm({ ...form, city: e.target.value })
                                            setErrors((prev) => ({
                                                ...prev,
                                                city: "",
                                            }));
                                        }}
                                        className="h-10 sm:h-[43px] px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all"
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-xs">
                                            {errors.city}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:gap-2.5">
                                    <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">State</label>
                                    <input
                                        type="text"
                                        placeholder="Enter State"
                                        id="state"
                                        value={form.state}
                                        onChange={(e) => {
                                            setForm({ ...form, state: e.target.value })
                                            setErrors((prev) => ({
                                                ...prev,
                                                state: "",
                                            }));
                                        }}
                                        className="h-10 sm:h-[43px] px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all"
                                    />
                                    {errors.state && (
                                        <p className="text-red-500 text-xs">
                                            {errors.state}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:gap-2.5">
                                    <label className="font-outfit font-medium text-sm sm:text-base text-[#121212] leading-6">Zip Code</label>
                                    <input
                                        type="text"
                                        id="zip"
                                        placeholder="Enter ZIP Code"
                                        value={form.zip}
                                        onChange={(e) => {
                                            setForm({ ...form, zip: e.target.value })
                                            setErrors((prev) => ({
                                                ...prev,
                                                zip: "",
                                            }));
                                        }}
                                        className="h-10 sm:h-[43px] px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition-all"
                                    />
                                    {errors.zip && (
                                        <p className="text-red-500 text-xs">
                                            {errors.zip}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form footer buttons */}
                    <div className="flex flex-row items-center justify-end gap-2 sm:gap-3">
                        <Link
                            href={`/admin/schools/${schoolId}`}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[rgba(0,0,0,0.20)] bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="sm:w-[18px] sm:h-[18px]">
                                <path d="M8.99973 10.0501L5.32473 13.7251C5.18723 13.8626 5.01223 13.9313 4.79973 13.9313C4.58723 13.9313 4.41223 13.8626 4.27473 13.7251C4.13723 13.5876 4.06848 13.4126 4.06848 13.2001C4.06848 12.9876 4.13723 12.8126 4.27473 12.6751L7.94973 9.0001L4.27473 5.3251C4.13723 5.1876 4.06848 5.0126 4.06848 4.8001C4.06848 4.5876 4.13723 4.4126 4.27473 4.2751C4.41223 4.1376 4.58723 4.06885 4.79973 4.06885C5.01223 4.06885 5.18723 4.1376 5.32473 4.2751L8.99973 7.9501L12.6747 4.2751C12.8122 4.1376 12.9872 4.06885 13.1997 4.06885C13.4122 4.06885 13.5872 4.1376 13.7247 4.2751C13.8622 4.4126 13.931 4.5876 13.931 4.8001C13.931 5.0126 13.8622 5.1876 13.7247 5.3251L10.0497 9.0001L13.7247 12.6751C13.8622 12.8126 13.931 12.9876 13.931 13.2001C13.931 13.4126 13.8622 13.5876 13.7247 13.7251C13.5872 13.8626 13.4122 13.9313 13.1997 13.9313C12.9872 13.9313 12.8122 13.8626 12.6747 13.7251L8.99973 10.0501Z" fill="#333333" />
                            </svg>
                            <span className="font-inter font-medium text-sm text-[#333]">Cancel</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg bg-[#0171F9] cursor-pointer hover:bg-[#0161d9] transition-colors disabled:opacity-50"
                        >
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="sm:w-[18px] sm:h-[18px]">
                                <path d="M2.25 3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H12.4395C12.8373 2.25008 13.2188 2.40818 13.5 2.6895L15.5303 4.71975C15.6709 4.86037 15.75 5.0511 15.75 5.25V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15.75 14.25 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75ZM6.75 14.25H11.25V9.75H6.75V14.25ZM12.75 14.25H14.25V5.5605L12.75 4.0605V5.25C12.75 5.64782 12.592 6.02936 12.3107 6.31066C12.0294 6.59196 11.6478 6.75 11.25 6.75H6.75C6.35218 6.75 5.97064 6.59196 5.68934 6.31066C5.40804 6.02936 5.25 5.64782 5.25 5.25V3.75H3.75V14.25H5.25V9.75C5.25 9.35218 5.40804 8.97064 5.68934 8.68934C5.97064 8.40804 6.35218 8.25 6.75 8.25H11.25C11.6478 8.25 12.0294 8.40804 12.3107 8.68934C12.592 8.97064 12.75 9.35218 12.75 9.75V14.25ZM6.75 3.75V5.25H11.25V3.75H6.75Z" fill="white" />
                            </svg>

                            <span className="hidden sm:inline font-inter font-semibold text-sm sm:text-base text-white">
                                {loading ? "Saving..." : "Save"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
