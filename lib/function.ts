// import { openai } from "@/lib/openai";

export const scrollToError = (errors: Record<string, string>) => {
  const firstErrorKey = Object.keys(errors)[0];
  if (!firstErrorKey) return;

  const el = document.getElementById(firstErrorKey);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.focus();
    }, 300);
  }
};

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