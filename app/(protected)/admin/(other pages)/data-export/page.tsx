"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import { useDebounce } from "@/lib/useDebounce";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

// ─── SVG Icons ────────────────────────────────────────────────────────────────


const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none"><path stroke="#121212" strokeWidth="1.5" d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14z" /><path stroke="#121212" strokeLinecap="round" strokeWidth="1.5" d="M7 4V2.5M17 4V2.5M2.5 9h19" /><path fill="#121212" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0" /></g></svg>
);

const ExportAllBtnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.58726 12.6622C6.69665 12.7716 6.845 12.833 6.99967 12.833C7.15435 12.833 7.3027 12.7716 7.41209 12.6622L9.74543 10.3289C9.85168 10.2189 9.91048 10.0715 9.90915 9.91857C9.90782 9.76562 9.84647 9.61931 9.73832 9.51116C9.63016 9.403 9.48386 9.34165 9.33091 9.34032C9.17796 9.33899 9.03061 9.39779 8.92059 9.50405L7.58301 10.8416V4.66647C7.58301 4.51176 7.52155 4.36338 7.41215 4.25399C7.30276 4.14459 7.15438 4.08313 6.99967 4.08313C6.84496 4.08313 6.69659 4.14459 6.5872 4.25399C6.4778 4.36338 6.41634 4.51176 6.41634 4.66647V10.8416L5.07876 9.50405C4.96874 9.39779 4.82139 9.33899 4.66844 9.34032C4.51549 9.34165 4.36919 9.403 4.26103 9.51116C4.15288 9.61931 4.09153 9.76562 4.0902 9.91857C4.08887 10.0715 4.14767 10.2189 4.25392 10.3289L6.58726 12.6622ZM2.91634 4.08313C3.07105 4.08313 3.21942 4.02168 3.32882 3.91228C3.43822 3.80288 3.49967 3.65451 3.49967 3.4998V2.33313H10.4997V3.4998C10.4997 3.65451 10.5611 3.80288 10.6705 3.91228C10.7799 4.02168 10.9283 4.08313 11.083 4.08313C11.2377 4.08313 11.3861 4.02168 11.4955 3.91228C11.6049 3.80288 11.6663 3.65451 11.6663 3.4998V2.33313C11.6663 2.02371 11.5434 1.72697 11.3246 1.50817C11.1058 1.28938 10.8091 1.16647 10.4997 1.16647H3.49967C3.19026 1.16647 2.89351 1.28938 2.67472 1.50817C2.45592 1.72697 2.33301 2.02371 2.33301 2.33313V3.4998C2.33301 3.65451 2.39447 3.80288 2.50386 3.91228C2.61326 4.02168 2.76163 4.08313 2.91634 4.08313Z"
      fill="white"
    />
  </svg>
);

const ExportRowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.52802 14.4713C7.65303 14.5963 7.82257 14.6665 7.99935 14.6665C8.17613 14.6665 8.34566 14.5963 8.47068 14.4713L11.1374 11.8046C11.2588 11.6789 11.326 11.5105 11.3245 11.3357C11.3229 11.1609 11.2528 10.9937 11.1292 10.8701C11.0056 10.7465 10.8384 10.6764 10.6636 10.6749C10.4888 10.6733 10.3204 10.7405 10.1947 10.862L8.66602 12.3906V5.33331C8.66602 5.1565 8.59578 4.98693 8.47075 4.86191C8.34573 4.73688 8.17616 4.66665 7.99935 4.66665C7.82254 4.66665 7.65297 4.73688 7.52794 4.86191C7.40292 4.98693 7.33268 5.1565 7.33268 5.33331V12.3906L5.80402 10.862C5.67828 10.7405 5.50988 10.6733 5.33508 10.6749C5.16028 10.6764 4.99308 10.7465 4.86947 10.8701C4.74586 10.9937 4.67575 11.1609 4.67423 11.3357C4.67271 11.5105 4.73991 11.6789 4.86135 11.8046L7.52802 14.4713ZM3.33268 4.66665C3.50949 4.66665 3.67906 4.59641 3.80409 4.47138C3.92911 4.34636 3.99935 4.17679 3.99935 3.99998V2.66665H11.9993V3.99998C11.9993 4.17679 12.0696 4.34636 12.1946 4.47138C12.3196 4.59641 12.4892 4.66665 12.666 4.66665C12.8428 4.66665 13.0124 4.59641 13.1374 4.47138C13.2624 4.34636 13.3327 4.17679 13.3327 3.99998V2.66665C13.3327 2.31302 13.1922 1.97389 12.9422 1.72384C12.6921 1.47379 12.353 1.33331 11.9993 1.33331H3.99935C3.64573 1.33331 3.30659 1.47379 3.05654 1.72384C2.80649 1.97389 2.66602 2.31302 2.66602 2.66665V3.99998C2.66602 4.17679 2.73625 4.34636 2.86128 4.47138C2.9863 4.59641 3.15587 4.66665 3.33268 4.66665Z"
      fill="#1E1E1E"
    />
  </svg>
);



// ─── Form Field Components ─────────────────────────────────────────────────────

function SearchField({
  label,
  value,
  onChange,
  onSelect,
  options,
  disabled = false,
  placeholder = "Search",
  isLoading = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 flex-1 relative">
      <label className="font-[Outfit] font-medium text-md text-[#121212]">{label}</label>
      <div className={`relative rounded-lg bg-[#F3F4F5]${disabled ? " opacity-55 cursor-not-allowed" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value), setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-transparent outline-none font-[Inter] text-sm font-normal text-[#121212] placeholder:text-[#737685] disabled:cursor-not-allowed disabled:text-[#737685]"
        />
        {isLoading && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#737685] text-sm">
            Loading...
          </span>
        )}
      </div>

      {showDropdown && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#F3F4F5] font-[Inter] text-sm text-[#121212] transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelectTeacherField({
  label,
  value,
  onChange,
  onSelect,
  options,
  selectedTeachers,
  onRemove,
  isLoading = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  options: string[];
  selectedTeachers: Array<{ name: string; id: string }>;
  onRemove: (id: string) => void;
  isLoading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 flex-1 relative">
      <label className="font-[Outfit] font-medium text-md text-[#121212]">{label}</label>
      <div className="relative rounded-lg bg-[#F3F4F5]">
        <div className={`flex flex-wrap gap-2 py-3 px-4`}>
          {selectedTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="inline-flex h-fit items-center gap-2 px-3 py-1 bg-[#0171F9] text-white rounded-lg text-sm"
            >
              <span>{teacher.name}</span>
              <button
                type="button"
                onClick={() => onRemove(teacher.id)}
                title="Remove"
                className="ml-1 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search teachers..."
            className="flex-1 min-w-[200px]  bg-transparent outline-none font-[Inter] text-sm font-normal text-[#121212] placeholder:text-[#737685]"
          />
          {isLoading && (
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#737685] text-sm">
              Loading...
            </span>
          )}
        </div>
      </div>

      {showDropdown && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                // setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#F3F4F5] font-[Inter] text-sm text-[#121212] transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="font-[Outfit] font-medium text-md text-[#121212] ">
        {label}
      </label>

      <div className="relative flex items-center rounded-lg bg-[#F3F4F5]">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => inputRef.current?.showPicker?.()}
          className="w-full px-4 py-3 text-[#121212] placeholder:text-gray-400 bg-transparent outline-none cursor-pointer"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.showPicker?.()}
          className="absolute right-5"
        >
          <CalendarIcon />
        </button>
      </div>
    </div>
  );
}


// ─── Page ──────────────────────────────────────────────────────────────────────


export default function DataExportPage() {
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [school, setSchool] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState<Array<{ name: string; id: string }>>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [filterByCity, setfilterByCity] = useState(false);
  const [removeFilter, setRemoveFilter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportedReports, setExportedReports] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [loadingCitiesFilter, setLoadingCitiesFilter] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportingRecordId, setExportingRecordId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [teacherSuggestions, setTeacherSuggestions] = useState<string[]>([]);
  const [exportedCities, setExportedCities] = useState<string[]>([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // const tableContainerRef = useRef<HTMLDivElement>(null);

  const debouncedCityInput = useDebounce(cityInput, 1000);
  const debouncedSchoolInput = useDebounce(schoolInput, 1000);
  const debouncedTeacherInput = useDebounce(teacherInput, 1000);
  const debouncedCityFilter = useDebounce(filterCity, 1000);

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      const city = debouncedCityInput ? debouncedCityInput : debouncedCityFilter
      try {
        const res = await fetch(`/api/data-export/cities?search=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (data.success) {
          setCitySuggestions(data.cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };

    if (debouncedCityInput || debouncedCityFilter) fetchCities();
  }, [debouncedCityInput, debouncedCityFilter]);


  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSchoolInput) params.append("search", debouncedSchoolInput);

        const res = await fetch(
          `/api/data-export/schools?${params}`
        );
        const data = await res.json();
        if (data.success) {
          setSchoolSuggestions(data.schools.map((s: any) => s.name));
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        toast.error("Failed to load schools");
      } finally {
        setLoadingSchools(false);
      }
    };

    if (debouncedSchoolInput) {
      fetchSchools();
    }
  }, [debouncedSchoolInput]);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const params = new URLSearchParams();
        if (debouncedTeacherInput) params.append("search", debouncedTeacherInput);

        const res = await fetch(
          `/api/data-export/teachers?${params}`
        );
        const data = await res.json();
        if (data.success) {
          setTeacherSuggestions(data.teachers.map((t: any) => t.name));
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers");
      } finally {
        setLoadingTeachers(false);
      }
    };

    if (debouncedTeacherInput) {
      fetchTeachers();
    }
  }, [debouncedTeacherInput]);

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setCityInput(selectedCity);
  };

  const handleCityFilter = (selectedCity2: string) => {
    setFilterCity(selectedCity2);
    setfilterByCity(true);
    setCurrentPage(1);
  };
  const handleSchoolSelect = async (selectedSchool: string) => {
    setSchool(selectedSchool);
    setSchoolInput(selectedSchool);

    const params = new URLSearchParams();
    params.append("search", selectedSchool);

    const res = await fetch(`/api/data-export/schools?${params}`);
    const data = await res.json();
    if (data.success) {
      const foundSchool = data.schools.find((s: any) => s.name === selectedSchool);
      if (foundSchool) {
        setSchoolId(foundSchool.id);
      }
    }
  };

  const handleTeacherSelect = async (selectedTeacher: string) => {
    const params = new URLSearchParams();
    params.append("search", selectedTeacher);

    const res = await fetch(
      `/api/data-export/teachers?${params}`
    );
    const data = await res.json();
    if (data.success) {
      const foundTeacher = data.teachers.find((t: any) => t.name === selectedTeacher);
      if (foundTeacher) {
        // Check if teacher already selected
        if (!teachers.find(t => t.id === foundTeacher.id)) {
          setTeachers([...teachers, { id: foundTeacher.id, name: foundTeacher.name }]);
          setTeacherInput("");
        }
      }
    }
  };

  const removeTeacher = (teacherId: string) => {
    setTeachers(teachers.filter(t => t.id !== teacherId));
  };

  const isDateRangeValid = () => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const canExport = isDateRangeValid();

  const handleExportRecord = async (recordId: string) => {
    setExportingRecordId(recordId);
    try {
      const response = await fetch(`/api/data-export/export-record?record_id=${recordId}`);

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to export record");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${recordId}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Record exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export record");
    } finally {
      setExportingRecordId(null);
    }
  };

  const handleExportAll = async () => {
    setIsExportingAll(true);
    try {
      const params = new URLSearchParams();
      if (filterCity) {
        params.append("city", filterCity);
      }

      const response = await fetch(`/api/data-export/export-all?${params}`);

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to export data");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reports_${filterCity || "all"}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleExportData = async () => {
    if (!isDateRangeValid()) {
      toast.error("Start date must be before or equal to end date");
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      if (city) params.append("city", city);
      if (schoolId) params.append("school_id", schoolId);
      if (school) params.append("school", school);
      if (teachers.length > 0) {
        teachers.forEach(t => params.append("teacher_ids", t.id));
      }
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await fetch(`/api/data-export/export?${params}`);

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to export data");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reports_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      fetchAllCities(currentPage);
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

 const fetchAllCities = async (page: Number) => {
      try {
        const res = await fetch(`/api/data-export/reports-history?page=${page}&limit=${itemsPerPage}`);
        const data = await res.json();
        if (data.success) {
          // Extract unique cities from all exported reports
          const citiesSet = new Set<string>();
          data.reports.forEach((report: any) => {
            if (report.city) {
              citiesSet.add(report.city);
            }
          });

          let reports = data.reports;

          // Filter reports by selected city
          if (filterCity) {
            reports = reports.filter((report: any) => report.city === filterCity);
          }

          setExportedReports(reports);
          setTotalPages(data.pagination.totalPages);
          setTotalReports(data.pagination.total);

          setExportedCities(Array.from(citiesSet).sort());

        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

  // Fetch all exported reports once on mount to extract cities
  useEffect(() => {
    fetchAllCities(1);
  }, []);

  // Fetch reports with pagination and filtering
  useEffect(() => {
    const fetchExportedReports = async () => {
      // setLoadingHistory(true);
      try {
        const res = await fetch(`/api/data-export/reports-history?city=${filterCity}&page=${currentPage}&limit=${itemsPerPage}`);
        const data = await res.json();
        if (data.success) {
          let reports = data.reports;

          setExportedReports(reports);
          setTotalPages(data.pagination.totalPages);
          setTotalReports(data.pagination.total);
        }
      } catch (error) {
        console.error("Error fetching exported reports:", error);
        toast.error("Failed to load export history");
      } finally {
        // setLoadingHistory(false);
        setfilterByCity(false);
      }
    };

   fetchExportedReports();
  }, [currentPage, filterByCity]);

  // useEffect(() => {
  //   const container = tableContainerRef.current;
  //   if (!container) return;

  //   const checkScroll = () => {
  //     setHasHorizontalScroll(container.scrollWidth > container.clientWidth);
  //   };

  //   checkScroll();

  //   const resizeObserver = new ResizeObserver(checkScroll);
  //   resizeObserver.observe(container);

  //   container.addEventListener("scroll", checkScroll);
  //   window.addEventListener("resize", checkScroll);

  //   return () => {
  //     resizeObserver.disconnect();
  //     container.removeEventListener("scroll", checkScroll);
  //     window.removeEventListener("resize", checkScroll);
  //   };
  // }, []);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
      <h1 className="font-outfit font-semibold text-2xl sm:text-3xl  text-[#121212] leading-5 mb-6 ">Data Export</h1>
      <div className="flex flex-col gap-10">
        {/* ── Export Data Card ── */}
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] sm:p-8 p-6 flex flex-col lg:flex-row gap-8">

          {/* Left: title + description */}
          <div className="lg:w-64 flex-shrink-0 flex flex-col gap-1">
            <h2 className="font-[Inter] font-bold text-xl sm:text-2xl text-[#121C28] leading-8">
              Export Data
            </h2>
            <p className="font-[Inter] font-normal sm:text-base text-sm text-[#434655] leading-[26px]">
              Select filters to generate Report.<br className="hidden sm:block" />All fields are optional.
            </p>
          </div>

          {/* Right: form */}
          <div className="flex-1 flex flex-col gap-5">
            <SearchField
              label="City"
              value={cityInput}
              onChange={setCityInput}
              onSelect={handleCitySelect}
              options={citySuggestions}
              isLoading={loadingCities}
              placeholder="Search city"
            />

            <SearchField
              label="School"
              value={schoolInput}
              onChange={setSchoolInput}
              onSelect={handleSchoolSelect}
              options={schoolSuggestions}
              isLoading={loadingSchools}
              placeholder="Search school"
            />

            <MultiSelectTeacherField
              label="Teacher(s)"
              value={teacherInput}
              onChange={setTeacherInput}
              onSelect={handleTeacherSelect}
              options={teacherSuggestions}
              selectedTeachers={teachers}
              onRemove={removeTeacher}
              isLoading={loadingTeachers}
            />

            <div className="flex flex-col sm:flex-row gap-5">
              <DateField label="Start Date" value={startDate} onChange={setStartDate} />
              <DateField label="End Date" value={endDate} onChange={setEndDate} />
            </div>

            <button
              onClick={handleExportData}
              disabled={!canExport || isExporting}
              className="w-fit flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0171F9] font-[Inter] font-semibold text-sm text-white leading-6 hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isExporting ? "Exporting..." : "Export Data"}
            </button>
            {startDate && endDate && !isDateRangeValid() && (
              <p className="text-sm text-red-600 font-[Inter]">
                Start date must be before or equal to end date
              </p>
            )}

          </div>
        </div>

        {/* ── Recent Data Export Table ── */}
        <div className="bg-white rounded-lg">
          <div className="px-5 py-6">
            <h2 className="font-[Outfit] font-semibold sm:text-2xl text-xl text-[#121212] leading-5 mb-6">
              Recent Data Export
            </h2>

            {/* Filter and Export All Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 relative">
                  <label className="font-[Outfit] font-medium text-md text-[#121212] whitespace-nowrap">
                    Filter by City
                  </label>

                  <div className="relative flex-1 max-w-xs rounded-lg bg-[#F3F4F5]">
                    <input
                      ref={inputRef}
                      type="text"
                      value={filterCity}
                      onChange={(e) => {
                        setFilterCity(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder="Search by city..."
                      className="w-full px-4 py-3 bg-transparent outline-none font-[Inter] text-sm text-[#121212] placeholder:text-[#737685]"
                    />

                    {loadingCities && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737685] text-sm">
                        Loading...
                      </span>
                    )}
                    {showDropdown && citySuggestions?.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {citySuggestions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCityFilter(opt);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F3F4F5] font-[Inter] text-sm text-[#121212]"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {filterCity && <button
                    type="button"
                    onClick={() => {
                      setCitySuggestions([]);
                      setfilterByCity(true);
                      setFilterCity("");
                    }}
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                  >
                    Clear Filter
                  </button>}


                </div>
              </div>

              <button
                onClick={handleExportAll}
                disabled={isExportingAll}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0171F9] font-[Inter] font-semibold text-sm text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <ExportAllBtnIcon />
                {isExportingAll ? "Exporting..." : "Export All"}
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              // ref={tableContainerRef}
              className="overflow-x-auto border-t border-[#E5E7EB]"
            >
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-y border-[#E5E7EB] bg-white">
                    <th className="text-left px-5 py-3.5 font-[Inter] font-medium sm:text-sm  text-[12px] text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">
                      School Name
                    </th>
                    <th className="text-left px-5 py-3.5 font-[Inter] font-medium sm:text-sm  text-[12px] text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">
                      Start Date
                    </th>
                    <th className="text-left px-5 py-3.5 font-[Inter] font-medium sm:text-sm  text-[12px] text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">
                      End Date
                    </th>
                    <th className="text-left px-5 py-3.5 font-[Inter] font-medium sm:text-sm  text-[12px] text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">
                      Report Date
                    </th>
                    <th className="text-left px-5 py-3.5 font-[Inter] font-medium sm:text-sm  text-[12px] text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#737685]">
                        Loading...
                      </td>
                    </tr>
                  ) : exportedReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#737685]">
                        No exports yet
                      </td>
                    </tr>
                  ) : (
                    exportedReports.map((report, idx) => (
                      <tr key={idx} className="border-b border-[#F2F4F7] bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-[17.5px] whitespace-nowrap">
                          <span className="font-[Inter] font-normal sm:text-[14px] text-[12px] text-[#030711] leading-5">
                            {report.school_name || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-[17.5px] font-[Inter] font-normal sm:text-[14px] text-[12px] text-[#030711] whitespace-nowrap">
                          {report.start_date ? new Date(report.start_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-5 py-[17.5px] font-[Inter] font-normal sm:text-[14px] text-[12px] text-[#030711] whitespace-nowrap">
                          {report.end_date ? new Date(report.end_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-5 py-[17.5px] font-[Inter] font-normal sm:text-[14px] text-[12px] text-[#030711] whitespace-nowrap">
                          {report.created_at ? new Date(report.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-5 py-[17.5px] whitespace-nowrap">
                          <div className="flex items-center justify-start gap-2">
                            <div
                              onClick={() => handleExportRecord(report.id)}
                              
                              title="Export"
                              className="cursor-pointer"
                            >
                              <ExportRowIcon />
                            </div>
                            {/* <button className="flex items-center justify-center px-4 py-1 rounded-md border border-[#EFF0F2] bg-white font-[Inter] font-normal sm:text-[14px] text-[12px] text-black/80 tracking-[-0.2px] leading-6 whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer">
                          View
                        </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E5E7EB] bg-white">
              <span className="font-[Inter] text-sm text-[#6F6C70]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalReports)} of {totalReports} exports
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${currentPage == 1 ? "" : "cursor-pointer"} w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
                >
                  <ChevronLeftIcon/>
                </button>
                <div className="flex items-center gap-1">
                  {(() => {
              const pageWindow = 4;
              const startPage = Math.max(1, currentPage - Math.floor(pageWindow / 2));
              const endPage = Math.min(totalPages, startPage + pageWindow - 1);
              const adjustedStart = Math.max(1, endPage - pageWindow + 1);

              return Array.from(
                { length: Math.min(pageWindow, totalPages) },
                (_, i) => adjustedStart + i
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-[13px] sm:text-[15px] transition-colors ${currentPage === page ? "bg-[#0171F9] text-white font-semibold" : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ));
            })()}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`${currentPage === totalPages ? "" : "cursor-pointer" } w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
                >
                 <ChevronRightIcon/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
