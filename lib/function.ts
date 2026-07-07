// import { openai } from "@/lib/openai";

export const scrollToError = (errors: Record<string, string>, formRef: any) => {
  const firstErrorKey = Object.keys(errors)[0];
  if (!firstErrorKey || !formRef.current) return;

  const el = document.getElementById(firstErrorKey);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.focus();
    }, 300);
  }
};

export const scrollToFirstError = (
  errors: Record<string, any>,
  formRef: any
) => {
  const firstError = Object.keys(errors).find((key) => errors[key]);

  if (!firstError || !formRef.current) return;
console.log("firstError:", firstError);
  const el = formRef.current.querySelector(
    `#${firstError}`
  ) as HTMLElement | null;
console.log("element:", el);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.focus();
    }, 300);
  }
};

export const formatDateTimeLocal = (date: string | Date) => {
  const d = new Date(date);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function getRandomEventColors() {
  const palettes = [
    { color: "#2563EB", bgColor: "#DBEAFE" }, // Blue
    { color: "#16A34A", bgColor: "#DCFCE7" }, // Green
    { color: "#DC2626", bgColor: "#FEE2E2" }, // Red
    { color: "#7C3AED", bgColor: "#EDE9FE" }, // Purple
    { color: "#EA580C", bgColor: "#FFEDD5" }, // Orange
    { color: "#0891B2", bgColor: "#CFFAFE" }, // Cyan
    { color: "#DB2777", bgColor: "#FCE7F3" }, // Pink
    { color: "#0F766E", bgColor: "#CCFBF1" }, // Teal
    { color: "#4338CA", bgColor: "#E0E7FF" }, // Indigo
    { color: "#B45309", bgColor: "#FEF3C7" }, // Amber
  ];

  const selected = palettes[Math.floor(Math.random() * palettes.length)];

  return {
    color: selected.color,
    borderColor: selected.color,
    bgColor: selected.bgColor,
  };
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export const AvgRatings = (val: any) => {
  type Ratings = {
    classroom_behavior: number;
    lesson_preparedness: number;
    school_cleanliness: number;
    staff_friendliness: number;
    support_level: number;
  };

  const ratings: Ratings = val;

  const values = Object.values(ratings);

  const total = values.reduce(
    (sum: number, value: number) => sum + value,
    0
  );


  let average = total / values.length;

  // If greater than 0 but less than 1
  if (average > 0 && average < 1) {
    average = 1;
  }
  return average.toFixed(1); // 0.6

}


export const getSentiment = (report: any) => {

  if (report?.AI_sentiment == "Positive") {
    return {
      label: "Positive",
      bg: "bg-green-100",
      text: "text-green-700",
    };
  }

  if (report?.AI_sentiment == "Neutral") {
    return {
      label: "Neutral",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    };
  }

  if (report?.AI_sentiment == "Negative") {
    return {
      label: "Negative",
      bg: "bg-red-100",
      text: "text-red-700",
    };
  }
  return {
    label: "Not sure",
    bg: "bg-[#F6F6F6]",
    text: "text-[#030711]",
  };

};

export const colors = [
  { bg: "bg-red-100", text: "text-red-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
];

export const getTeacherColor = (name: string) => {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }

  return colors[hash % colors.length];
};