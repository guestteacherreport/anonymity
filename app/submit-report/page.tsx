"use client";

import { useRef, useState, useReducer, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { scrollToError } from "@/lib/function";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

/* ─── Types ───────────────────────────────────────── */

type RatingKeys =
  | "classroomBehavior"
  | "lessonPreparedness"
  | "staffFriendliness"
  | "schoolCleanliness"
  | "supportLevel";

type FormState = {
  user_id: number,
  yourName: string,
  yourIdentity: string,
  newIdentity: string,
  existingIdentity: string,
  schoolName: string,
  schoolId: number,
  teacherId: number,
  teacherName: string,
  schoolAssociation: string,
  date: string,
  gradeLevel: string;
  schoolGrades: string[];
  ratings: Record<RatingKeys, number>;
  selectedTags: string[];
  returnToSchool: ReturnChoice;
  returnToTeacher: ReturnChoice;
  postAs: "anonymous" | "show";
  feedback: string;
  schoolComment: string;
  teacherComment: string;
  sentiments: string;
  error: string;
  city: string;
};

type FormErrors = Partial<Record<keyof FormState | "ratings", string>>;

type Action =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "SET_RATING"; key: RatingKeys; value: number }
  | { type: "TOGGLE_TAG"; tag: string }
  | { type: "RESET" };

/* ─── Initial State ───────────────────────────────── */

const initialState: FormState = {
  user_id: 0,
  yourName: "",
  schoolName: "",
  yourIdentity:"",
  newIdentity: "",
  existingIdentity: "",
  schoolId: 0,
  teacherId: 0,
  schoolGrades: [],
  schoolAssociation: "",
  teacherName: "",
  date: "",
  gradeLevel: "",
  ratings: {
    classroomBehavior: 0,
    lessonPreparedness: 0,
    staffFriendliness: 0,
    schoolCleanliness: 0,
    supportLevel: 0,
  },
  selectedTags: [],
  returnToSchool: null,
  returnToTeacher: null,
  postAs: "anonymous",
  feedback: "",
  schoolComment: "",
  teacherComment: "",
  sentiments: "",
  error:"",
  city:"",
};

/* ─── Reducer ─────────────────────────────────────── */

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_RATING":
      return {
        ...state,
        ratings: {
          ...state.ratings,
          [action.key]: action.value,
        },
      };

    case "TOGGLE_TAG":
      return {
        ...state,
        selectedTags: state.selectedTags.includes(action.tag)
          ? state.selectedTags.filter((t) => t !== action.tag)
          : [...state.selectedTags, action.tag],
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

/* ─── Validation ─────────────────────────────────── */

function validateForm(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.schoolName.trim()) {
    errors.schoolName = "School Name is required";
  }

  if (!state.teacherName.trim()) {
    errors.teacherName = "Teacher Name is required";
  }

  if (!state.date) {
    errors.date = "Date is required";
  }



  if (!state.gradeLevel) {
    errors.gradeLevel = "Grade level is required";
  }

  if (!state.feedback.trim()) {
    errors.feedback = "Feedback is required";
  }

  if (state.selectedTags.length === 0) {
    errors.selectedTags = "Select at least one tag";
  }

  if (!state.returnToSchool) {
    errors.returnToSchool = "Required";
  }

  if (!state.returnToTeacher) {
    errors.returnToTeacher = "Required";
  }
  // if (!state.newIdentity && !state.existingIdentity) {
  //   errors.yourIdentity = "Please create a new code or enter an existing code";
  // }
  // if (state.newIdentity && state.existingIdentity) {
  //   errors.yourIdentity = "Fill either New Code or Existing Code, not both";
  // }

  // // ratings validation
  const hasAnyRating = Object.values(state.ratings).some((v) => v > 0);
  if (!hasAnyRating) {
    errors.ratings = "Please give ratings";
  }

  return errors;
}

/* ─── Icon components ─────────────────────────────────────────────────── */

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.6">
      <path d="M6.33333 10.6667C5.12222 10.6667 4.09733 10.2471 3.25867 9.408C2.42 8.56889 2.00044 7.544 2 6.33333C1.99956 5.12267 2.41911 4.09778 3.25867 3.25867C4.09822 2.41956 5.12311 2 6.33333 2C7.54356 2 8.56867 2.41956 9.40867 3.25867C10.2487 4.09778 10.668 5.12267 10.6667 6.33333C10.6667 6.82222 10.5889 7.28333 10.4333 7.71667C10.2778 8.15 10.0667 8.53333 9.8 8.86667L13.5333 12.6C13.6556 12.7222 13.7167 12.8778 13.7167 13.0667C13.7167 13.2556 13.6556 13.4111 13.5333 13.5333C13.4111 13.6556 13.2556 13.7167 13.0667 13.7167C12.8778 13.7167 12.7222 13.6556 12.6 13.5333L8.86667 9.8C8.53333 10.0667 8.15 10.2778 7.71667 10.4333C7.28333 10.5889 6.82222 10.6667 6.33333 10.6667ZM6.33333 9.33333C7.16667 9.33333 7.87511 9.04178 8.45867 8.45867C9.04222 7.87556 9.33378 7.16711 9.33333 6.33333C9.33289 5.49956 9.04133 4.79133 8.45867 4.20867C7.876 3.626 7.16756 3.33422 6.33333 3.33333C5.49911 3.33244 4.79089 3.62422 4.20867 4.20867C3.62644 4.79311 3.33467 5.50133 3.33333 6.33333C3.332 7.16533 3.62378 7.87378 4.20867 8.45867C4.79356 9.04356 5.50178 9.33511 6.33333 9.33333Z" fill="#1E1E1E" />
    </g>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.6" clipPath="url(#cal-clip)">
      <path d="M12.0002 2.66675H4.00016C2.5274 2.66675 1.3335 3.86066 1.3335 5.33341V12.0001C1.3335 13.4728 2.5274 14.6667 4.00016 14.6667H12.0002C13.4729 14.6667 14.6668 13.4728 14.6668 12.0001V5.33341C14.6668 3.86066 13.4729 2.66675 12.0002 2.66675Z" stroke="#1E1E1E" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.3335 1.33337V4.00004M10.6668 1.33337V4.00004M1.3335 6.66671H14.6668" stroke="#1E1E1E" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs><clipPath id="cal-clip"><rect width="16" height="16" fill="white" /></clipPath></defs>
  </svg>
);

const StarFilled = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.3462 10.4515L16.5806 11.0062L17.1802 11.059L23.2271 11.5834L18.6538 15.5482L18.1987 15.9427L18.3345 16.5297L19.6968 22.4232L14.5171 19.2982L14.0005 18.9867L13.4839 19.2982L8.30225 22.4232L9.6665 16.5297L9.80225 15.9427L9.34717 15.5482L4.77295 11.5834L10.8198 11.059L11.4204 11.0062L11.6548 10.4515L13.9995 4.90173L16.3462 10.4515Z" fill="#FFBF0F" stroke="#FFBF0F" strokeWidth="2" />
  </svg>
);

const StarEmpty = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.3462 10.4515L16.5806 11.0062L17.1802 11.059L23.2271 11.5834L18.6538 15.5482L18.1987 15.9427L18.3345 16.5297L19.6968 22.4232L14.5171 19.2982L14.0005 18.9867L13.4839 19.2982L8.30225 22.4232L9.6665 16.5297L9.80225 15.9427L9.34717 15.5482L4.77295 11.5834L10.8198 11.059L11.4204 11.0062L11.6548 10.4515L13.9995 4.90173L16.3462 10.4515Z" fill="white" stroke="#FFBF0F" strokeWidth="2" />
  </svg>
);

const ThumbUpIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.73317 5.33334H13.9998C14.3535 5.33334 14.6926 5.47382 14.9426 5.72386C15.1927 5.97391 15.3332 6.31305 15.3332 6.66667V8.07001C15.3332 8.24334 15.2992 8.41667 15.2332 8.57734L13.1698 13.5873C13.1196 13.7096 13.0342 13.8142 12.9244 13.8878C12.8146 13.9614 12.6854 14.0007 12.5532 14.0007H1.33317C1.15636 14.0007 0.98679 13.9304 0.861766 13.8054C0.736742 13.6804 0.666504 13.5108 0.666504 13.334V6.66667C0.666504 6.48986 0.736742 6.32029 0.861766 6.19527C0.98679 6.07024 1.15636 6.00001 1.33317 6.00001H3.6545C3.76129 5.99996 3.86651 5.97426 3.96129 5.92507C4.05608 5.87588 4.13766 5.80464 4.19917 5.71734L7.8345 0.56734C7.88046 0.502215 7.94823 0.455714 8.02553 0.436267C8.10283 0.41682 8.18453 0.425715 8.25584 0.46134L9.46517 1.06667C9.80537 1.23676 10.0772 1.51808 10.2354 1.86394C10.3937 2.2098 10.4289 2.59938 10.3352 2.96801L9.73317 5.33334ZM4.6665 7.05867V12.6667H12.1065L13.9998 8.07001V6.66667H9.73317C9.5301 6.66664 9.32973 6.62023 9.14732 6.53098C8.96492 6.44172 8.80532 6.31199 8.68069 6.15166C8.55606 5.99134 8.46969 5.80467 8.42818 5.60589C8.38667 5.40711 8.39111 5.20147 8.44117 5.00467L9.04317 2.63934C9.06184 2.56565 9.05477 2.4878 9.02312 2.41868C8.99148 2.34957 8.93716 2.29335 8.86917 2.25934L8.4285 2.03867L5.2885 6.48667C5.12184 6.72267 4.9085 6.91667 4.6665 7.05867ZM3.33317 7.33334H1.99984V12.6667H3.33317V7.33334Z" fill={active ? "#121212" : "#6B7280"} />
  </svg>
);

const ThumbDownIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.73317 10.6667H13.9998C14.3535 10.6667 14.6926 10.5262 14.9426 10.2761C15.1927 10.0261 15.3332 9.68695 15.3332 9.33333V7.92999C15.3332 7.75666 15.2992 7.58333 15.2332 7.42266L13.1698 2.41266C13.1196 2.29039 13.0342 2.18581 12.9244 2.11222C12.8146 2.03862 12.6854 1.99932 12.5532 1.99933H1.33317C1.15636 1.99933 0.98679 2.06956 0.861766 2.19459C0.736742 2.31961 0.666504 2.48918 0.666504 2.66599V9.33333C0.666504 9.51014 0.736742 9.67971 0.861766 9.80473C0.98679 9.92976 1.15636 9.99999 1.33317 9.99999H3.6545C3.76129 10 3.86651 10.0257 3.96129 10.0749C4.05608 10.1241 4.13766 10.1954 4.19917 10.2827L7.8345 15.4327C7.88046 15.4978 7.94823 15.5443 8.02553 15.5637C8.10283 15.5832 8.18453 15.5743 8.25584 15.5387L9.46517 14.9333C9.80537 14.7632 10.0772 14.4819 10.2354 14.1361C10.3937 13.7902 10.4289 13.4006 10.3352 13.032L9.73317 10.6667ZM4.6665 8.94133V3.33333H12.1065L13.9998 7.92999V9.33333H9.73317C9.5301 9.33336 9.32973 9.37977 9.14732 9.46902C8.96492 9.55828 8.80532 9.68801 8.68069 9.84834C8.55606 10.0087 8.46969 10.1953 8.42818 10.3941C8.38667 10.5929 8.39111 10.7985 8.44117 10.9953L9.04317 13.3607C9.06184 13.4343 9.05477 13.5122 9.02312 13.5813C8.99148 13.6504 8.93716 13.7067 8.86917 13.7407L8.4285 13.9613L5.2885 9.51333C5.12184 9.27733 4.9085 9.08333 4.6665 8.94133ZM3.33317 8.66666H1.99984V3.33333H3.33317V8.66666Z" fill={active ? "#121212" : "#6B7280"} />
  </svg>
);

const MaybeIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.31787 12.5L9.32568 12.5078V15.4912C9.3246 15.4924 9.32339 15.4945 9.32178 15.4961L9.31787 15.5H6.33252L6.32861 15.4961C6.32731 15.4948 6.32663 15.4932 6.32568 15.4922V12.5059C6.3264 12.5051 6.32676 12.5038 6.32764 12.5029L6.32861 12.5039C6.33009 12.5024 6.33137 12.501 6.33252 12.5H9.31787ZM8.1001 0.5C8.70079 0.5 9.31127 0.616324 9.93408 0.854492C10.5628 1.09505 11.1261 1.4158 11.6255 1.81543C12.1136 2.20591 12.5127 2.68501 12.8237 3.25781C13.1268 3.81605 13.2758 4.39477 13.2759 5C13.2759 5.30102 13.2431 5.58277 13.1802 5.84668L13.1069 6.10547C12.9867 6.47028 12.8575 6.74505 12.7271 6.94238V6.94336C12.5979 7.13893 12.4043 7.35177 12.1343 7.58008C11.8443 7.8249 11.628 7.98777 11.4771 8.08008H11.4761L10.731 8.51367C10.3141 8.74741 9.97068 9.07609 9.70068 9.48828V9.48926C9.46264 9.85298 9.27588 10.2376 9.27588 10.6006C9.27584 10.6145 9.27261 10.6452 9.22998 10.7002H6.38037C6.33963 10.6222 6.3257 10.5573 6.32568 10.5V9.9375C6.32568 9.38949 6.53585 8.85113 7.01221 8.3125C7.51338 7.74551 8.05426 7.33961 8.63037 7.08105L8.6333 7.0791C9.15089 6.84218 9.57687 6.57245 9.854 6.25098C10.1574 5.89902 10.2876 5.45728 10.2876 4.97461C10.2875 4.40673 9.96248 3.96249 9.49072 3.6377H9.48975C9.01212 3.30945 8.46373 3.15039 7.86279 3.15039C7.32404 3.15042 6.83288 3.25546 6.41064 3.48926L6.23389 3.59766L6.22217 3.60547C5.86645 3.85972 5.38076 4.39256 4.78467 5.1377C4.78253 5.14023 4.77963 5.1416 4.77783 5.14355C4.77081 5.14066 4.76142 5.13665 4.74951 5.12988L2.729 3.59082H2.72998C2.72833 3.58955 2.72729 3.58794 2.72607 3.58691L2.729 3.58301C3.97434 1.51272 5.74692 0.500053 8.1001 0.5Z" stroke={active ? "#121212" : "#6B7280"} />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path d="M15 9.75C15 13.5 12.375 15.375 9.255 16.4625C9.09162 16.5179 8.91415 16.5152 8.7525 16.455C5.625 15.375 3 13.5 3 9.75V4.5C3 4.08607 3.33606 3.75 3.75 3.75C5.25 3.75 7.125 2.85 8.43 1.71C8.75826 1.42955 9.24174 1.42955 9.57 1.71C10.8825 2.8575 12.75 3.75 14.25 3.75C14.6639 3.75 15 4.08607 15 4.5V9.75" stroke="#856404" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="#856404" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AnonymousIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5003 13.4465C12.8323 13.4465 13.9163 12.363 13.9163 11.031C13.9163 9.69897 12.8323 8.61496 11.5003 8.61496C10.5863 8.61496 9.79883 9.13096 9.38833 9.88146H6.61183C6.20183 9.13096 5.41433 8.61496 4.50033 8.61496C3.16833 8.61496 2.08433 9.69897 2.08433 11.031C2.08433 12.363 3.16833 13.446 4.50033 13.446C5.83233 13.446 6.91583 12.363 6.91583 11.031C6.91583 10.9795 6.90383 10.932 6.90083 10.881H9.09933C9.09633 10.932 9.08433 10.9795 9.08433 11.031C9.08526 11.6714 9.34013 12.2852 9.79304 12.738C10.246 13.1907 10.8599 13.4458 11.5003 13.4465ZM11.5003 9.61496C12.2808 9.61496 12.9163 10.25 12.9163 11.031C12.9163 11.812 12.2813 12.446 11.5003 12.446C10.7193 12.446 10.0843 11.8115 10.0843 11.031C10.0843 10.2505 10.7193 9.61496 11.5003 9.61496ZM4.50033 12.4465C3.71933 12.4465 3.08433 11.8115 3.08433 11.031C3.08433 10.2505 3.71933 9.61496 4.50033 9.61496C5.28133 9.61496 5.91583 10.25 5.91583 11.031C5.91583 11.812 5.28083 12.4465 4.50033 12.4465ZM15.1373 7.39046C14.3537 7.16766 13.5599 6.98179 12.7588 6.83346L11.9903 2.95396C11.9603 2.80896 11.8703 2.68396 11.7453 2.61396C11.6814 2.57966 11.6109 2.55925 11.5385 2.55408C11.4662 2.54891 11.3935 2.55909 11.3253 2.58396C9.18266 3.39397 6.818 3.39397 4.67533 2.58396C4.60829 2.55776 4.53624 2.54685 4.46444 2.55204C4.39264 2.55723 4.32291 2.57839 4.26033 2.61396C4.13033 2.68396 4.04033 2.80896 4.01033 2.95396L3.24183 6.83396C2.44056 6.98212 1.64668 7.16782 0.86283 7.39046C0.799645 7.40849 0.740633 7.43879 0.689167 7.47964C0.6377 7.52049 0.59479 7.57108 0.562888 7.62852C0.530986 7.68596 0.510719 7.74913 0.503245 7.81441C0.495771 7.87969 0.501237 7.9458 0.51933 8.00896C0.59533 8.27396 0.87233 8.42546 1.13783 8.35246C5.62286 7.06931 10.3778 7.06931 14.8628 8.35246C14.9887 8.38371 15.1219 8.36485 15.2341 8.29984C15.3464 8.23484 15.4291 8.12879 15.4647 8.00403C15.5003 7.87928 15.486 7.74557 15.425 7.63111C15.3639 7.51665 15.2608 7.43037 15.1373 7.39046ZM4.29383 6.65846L4.88033 3.71396C6.9111 4.35396 9.08956 4.35396 11.1203 3.71396L11.7053 6.65796C9.24757 6.30321 6.75159 6.30371 4.29383 6.65846Z" fill={active ? "black" : "#6B7280"} />
  </svg>
);

const UserIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.431 13.2517C13.4791 11.6061 12.0122 10.4261 10.3003 9.8667C11.1471 9.36261 11.805 8.5945 12.173 7.68032C12.5409 6.76614 12.5987 5.75645 12.3372 4.8063C12.0758 3.85615 11.5098 3.01807 10.7259 2.42078C9.94213 1.82349 8.98392 1.5 7.99846 1.5C7.013 1.5 6.05479 1.82349 5.27098 2.42078C4.48716 3.01807 3.92108 3.85615 3.65967 4.8063C3.39826 5.75645 3.45598 6.76614 3.82395 7.68032C4.19193 8.5945 4.84981 9.36261 5.69659 9.8667C3.98471 10.4255 2.51784 11.6055 1.56596 13.2517C1.53105 13.3086 1.5079 13.372 1.49787 13.438C1.48783 13.504 1.49112 13.5713 1.50754 13.636C1.52396 13.7008 1.55317 13.7615 1.59346 13.8148C1.63374 13.868 1.68428 13.9127 1.7421 13.9461C1.79992 13.9795 1.86384 14.0009 1.93009 14.0092C1.99634 14.0175 2.06358 14.0125 2.12785 13.9943C2.19211 13.9762 2.2521 13.9454 2.30426 13.9038C2.35643 13.8621 2.39972 13.8104 2.43159 13.7517C3.60909 11.7167 5.69034 10.5017 7.99846 10.5017C10.3066 10.5017 12.3878 11.7167 13.5653 13.7517C13.5972 13.8104 13.6405 13.8621 13.6927 13.9038C13.7448 13.9454 13.8048 13.9762 13.8691 13.9943C13.9333 14.0125 14.0006 14.0175 14.0668 14.0092C14.1331 14.0009 14.197 13.9795 14.2548 13.9461C14.3126 13.9127 14.3632 13.868 14.4035 13.8148C14.4438 13.7615 14.473 13.7008 14.4894 13.636C14.5058 13.5713 14.5091 13.504 14.4991 13.438C14.489 13.372 14.4659 13.3086 14.431 13.2517ZM4.49846 6.0017C4.49846 5.30947 4.70373 4.63278 5.08832 4.0572C5.4729 3.48163 6.01953 3.03303 6.65907 2.76812C7.29861 2.50322 8.00234 2.4339 8.68128 2.56895C9.36021 2.704 9.98385 3.03734 10.4733 3.52683C10.9628 4.01631 11.2962 4.63995 11.4312 5.31888C11.5663 5.99782 11.4969 6.70155 11.232 7.34109C10.9671 7.98063 10.5185 8.52726 9.94296 8.91184C9.36738 9.29643 8.69069 9.5017 7.99846 9.5017C7.07051 9.50071 6.18085 9.13164 5.52468 8.47548C4.86852 7.81932 4.49945 6.92965 4.49846 6.0017Z" fill={active ? "#6B7280" : "#6B7280"} />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 13.3333V9.33334L7.33333 8.00001L2 6.66667V2.66667L14.6667 8.00001L2 13.3333Z" fill="white" />
  </svg>
);

/* ─── Warning banner ─────────────────────────────────────────────────── */

const WarningBanner = () => (
  <div className="flex items-start gap-2 p-[17px_16px] rounded-[6px] border border-[#FFC107] bg-[#FFF3CD]">
    <ShieldIcon />
    <p className="text-[#856404] font-inter text-sm font-medium leading-[23px]">
      <strong className="font-bold">IMPORTANT — To protect minors:</strong>{" "}
      Under NO circumstance should a student&apos;s name or description be posted or mentioned on this site at any time!!!
    </p>
  </div>
);

/* ─── Constants ──────────────────────────────────────────────────────── */

const GRADE_LEVELS = ["Pre-K", "Elementary", "Middle School", "High School", "Special Ed"];

const RATING_CATEGORIES: { label: string; key: RatingKeys }[] = [
  { label: "Classroom Behavior", key: "classroomBehavior" },
  { label: "Lesson Preparedness", key: "lessonPreparedness" },
  { label: "Staff Friendliness", key: "staffFriendliness" },
  { label: "School Cleanliness", key: "schoolCleanliness" },
  { label: "Support Level", key: "supportLevel" },
];

const ALL_TAGS = [
  "Friendly Teachers", "Unfriendly Teachers", "Unwelcoming Environment",
  "Friendly Students", "Unfriendly Students", "Great Leadership", "Poor Leadership",
  "Job As Described", "Job NOT As Described", "Positive Impact Student(s)",
  "Negative Impact Student(s)", "Helpful Aides/Proctors", "Unhelpful Aides/Proctors",
];

const NEGATIVE_TAGS = new Set([
  "Unfriendly Teachers", "Unwelcoming Environment", "Unfriendly Students",
  "Poor Leadership", "Job NOT As Described", "Negative Impact Student(s)", "Unhelpful Aides/Proctors",
]);

type ReturnChoice = "yes" | "no" | "maybe" | null;

/* ─── Star rating ────────────────────────────────────────────────────── */

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered !== null ? hovered : value;
  return (
    <div className="flex items-center gap-[10px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className="cursor-pointer p-0 bg-transparent border-0"
        >
          {display >= star ? <StarFilled /> : <StarEmpty />}
        </button>
      ))}
    </div>
  );
}

/* ─── Return / Yes-No-Maybe choice group ────────────────────────────── */

function ReturnChoiceGroup({ value, onChange }: { value: ReturnChoice; onChange: (v: ReturnChoice) => void }) {
  return (
    <div className="flex p-[6px] gap-[10px] rounded-lg bg-[#F3F4F5]">
      <button
        type="button"
        onClick={() => onChange("yes")}
        className={`flex flex-1 items-center gap-[6px] px-4 py-[13px] rounded-lg cursor-pointer transition-all ${value === "yes" ? "bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.08)]" : "bg-transparent"
          }`}
      >
        <ThumbUpIcon active={value === "yes"} />
        <span className={`font-inter text-sm leading-none ${value === "yes" ? "text-[#121212]" : "text-[#6B7280]"}`}>Yes</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("no")}
        className={`flex flex-1 items-center gap-[6px] px-4 py-[13px] rounded-lg cursor-pointer transition-all ${value === "no" ? "bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.08)]" : "bg-transparent"
          }`}
      >
        <ThumbDownIcon active={value === "no"} />
        <span className={`font-inter text-sm leading-none ${value === "no" ? "text-[#121212]" : "text-[#6B7280]"}`}>No</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("maybe")}
        className={`flex flex-1 items-center gap-[6px] px-4 py-[13px] rounded-lg cursor-pointer transition-all ${value === "maybe" ? "bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.08)]" : "bg-transparent"
          }`}
      >
        <MaybeIcon active={value === "maybe"} />
        <span className={`font-inter text-sm leading-none ${value === "maybe" ? "text-[#121212]" : "text-[#6B7280]"}`}>Maybe</span>
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function SubmitReportPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const dateRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  // Schools search state
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [schoolSearchLoading, setSchoolSearchLoading] = useState(false);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);

  // Teachers search state
  const [teacherSuggestions, setTeacherSuggestions] = useState<string[]>([]);
  const [teacherSearchLoading, setTeacherSearchLoading] = useState(false);
  const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false);

  // Form submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    (field: keyof FormState, value: any) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  // Fetch schools by search query
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

  // Fetch teachers by search query
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

  const setRating = useCallback(
    (key: RatingKeys, value: number) => {
      dispatch({ type: "SET_RATING", key, value });
    },
    []
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ratings = [
      state.ratings.classroomBehavior,
      state.ratings.lessonPreparedness,
      state.ratings.staffFriendliness,
      state.ratings.schoolCleanliness,
      state.ratings.supportLevel,
    ];

    const avg =
      ratings.reduce((sum, val) => sum + Number(val || 0), 0) /
      ratings.length;

    // add new param

    state.sentiments =
  avg >= 4
    ? "Positive"
    : avg >= 2.7
      ? "Neutral"
      : avg > 0
        ? "Negative"
        : "";

    if (session) {
      state.user_id = Number(session?.user?.id)
    }
    

    const validationErrors = validateForm(state);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToError(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/submit-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });
     
      const data = await response.json();
      if (!response.ok) {
        setIsSubmitting(false);
        setErrors({["yourIdentity"]: data.message})
        toast.error(data.message || "Failed to submit report", {
            duration: 6000,
          });
        // throw new Error("Failed to submit report");
      } else {
        dispatch({ type: "RESET" });
        router.push(`/submit-report/success${state.postAs === "anonymous" ? `?anonymous=true` : ""}`);

      }

     
    } catch (error) {
      console.error("Error submitting report:", error);
      setIsSubmitting(false);
    }
  };

  /* shared input style */
  const inputBase = "flex items-center text-sm gap-[6px] px-4  rounded-lg bg-[#F3F4F5] overflow-hidden";
  const fieldLabel = "font-outfit text-base font-medium text-[#121212] leading-6";
  const sectionHeading = "font-outfit text-xl font-semibold leading-none text-[#0171F9] text-lg sm:text-xl";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-[#F7F9FE] via-[#F7F9FE] to-[#F7F9FE]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-8 sm:pt-15 pb-12 sm:pb-[80px] flex flex-col gap-6 sm:gap-7">

          {/* Page heading */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 text-center">
            <h1 className="font-inter text-2xl sm:text-4xl lg:text-5xl font-bold text-[#121212] leading-[1.2]">Submit a Report</h1>
            <p className="font-inter text-sm sm:text-base text-[#121212]/88 leading-relaxed tracking-[0.2px]">
              Share your experience to help other guest teachers.
            </p>
          </div>

          {/* Top warning */}
          <WarningBanner />

          {/* Form card */}
          <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] p-4 sm:p-8 lg:p-12">
            <form onSubmit={handleSubmit} className=" flex flex-col gap-6 sm:gap-10">
              {/* ── Assignment Details ── */}
              <section className="flex flex-col gap-5 sm:gap-8">
                <h2 className={sectionHeading}>Assignment Details</h2>

                

                {/* School Name */}
                <div className="flex flex-col gap-2 relative">
                  <label className={fieldLabel}>School Name</label>
                  <div className="relative">
                    <div className={`${inputBase} py-[14px]`}>
                      <SearchIcon />
                      <input
                        type="text"
                        id="schoolName"
                        placeholder="Search for institution..."
                        value={state.schoolName}
                        onChange={(e) => {
                          if (e.target.value) {
                            setErrors({ ...errors, ["teacherName"]: "" });
                          }
                          updateField("teacherName", "");
                          setTeacherSuggestions([]);
                          updateField("schoolGrades", []);
                          updateField("schoolName", e.target.value);
                          fetchSchools(e.target.value);
                          setShowSchoolSuggestions(true);
                          setErrors((prev) => ({
                            ...prev,
                            schoolName: "",
                          }));
                        }}
                        onFocus={() => setShowSchoolSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 200)}
                        className="bg-transparent outline-none w-full font-inter text-sm text-[#121212] placeholder-[#6B7280]"
                        autoComplete="off"
                      />

                    </div>

                    {/* School suggestions dropdown */}
                    {showSchoolSuggestions && (state.schoolName.trim() || schoolSuggestions.length > 0) && (
                      <div className="absolute  top-full left-0 right-0 mt-1 bg-white border border-[#E0E0E2] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
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
                                updateField("teacherName", "");
                                setTeacherSuggestions([]);
                                updateField("schoolGrades", []);
                                updateField("schoolName", school.school_name);
                                updateField("city",school.city);
                                updateField("schoolGrades", school.grade_level);
                                updateField("schoolId", school.id);
                                updateField(
                                  "schoolAssociation",
                                  school.school_association === "School District"
                                    ? school.school_district_name
                                    : school.school_association
                                );

                                setShowSchoolSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-[#F3F4F5] font-inter text-sm text-[#121212] border-b border-[#E0E0E2] last:border-b-0 transition-colors"
                            >
                              {school.school_name}
                            </button>
                          ))
                        )}
                        {!schoolSearchLoading && schoolSuggestions.length === 0 && state.schoolName.trim() && (
                          <div className="px-4 py-3 text-center text-sm text-[#6B7280]">No schools found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.schoolName && (
                    <p className="text-red-500 text-xs">{errors.schoolName}</p>
                  )}
                </div>

                {/* Teacher + Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2 relative">
                    <label className={fieldLabel}>Teacher Name</label>
                    <div className="relative">
                      <div className={`${inputBase} py-[14px]`}>
                        <SearchIcon />
                        <input
                          type="text"
                          id="teacherName"
                          placeholder="Search for Teacher..."
                          value={state.teacherName}
                          // disabled={!state.schoolId || !state.schoolName}
                          onChange={(e) => {
                            if (!state.schoolId || !state.schoolName) {
                              setErrors({ ...errors, ["teacherName"]: "Please first select school" });

                              return;
                            } else {
                              setErrors({ ...errors, ["teacherName"]: "" });
                            }
                            updateField("teacherName", e.target.value);

                            fetchTeachers(e.target.value, state.schoolId);
                            setShowTeacherSuggestions(true);
                            setErrors((prev) => ({
                              ...prev,
                              teacherName: "",
                            }));
                          }}
                          onFocus={() => setShowTeacherSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowTeacherSuggestions(false), 200)}
                          className="bg-transparent outline-none w-full font-inter text-sm text-[#121212] placeholder-[#6B7280]"
                          autoComplete="off"
                        />

                      </div>

                      {/* Teacher suggestions dropdown */}
                      {showTeacherSuggestions && (state.teacherName.trim() || teacherSuggestions.length > 0) && (
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
                                  updateField("teacherName", teacher.name);
                                  updateField("teacherId", teacher.id);
                                  setShowTeacherSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#F3F4F5] font-inter text-sm text-[#121212] border-b border-[#E0E0E2] last:border-b-0 transition-colors"
                              >
                                {teacher.name}
                              </button>
                            ))
                          )}
                          {!teacherSearchLoading && teacherSuggestions.length === 0 && state.teacherName.trim() && (
                            <div className="px-4 py-3 text-center text-sm text-[#6B7280]">No teachers found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {errors.teacherName && (
                      <p className="text-red-500 text-xs">{errors.teacherName}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={fieldLabel}>Date of Assignment</label>
                    <div onClick={() => dateRef.current?.showPicker()} className={`${inputBase} justify-between py-[14px]`}>
                      <input
                        ref={dateRef}
                        type="date"
                        id="date"
                        value={state.date}
                        onChange={(e) => {
                          updateField("date", e.target.value)
                          setErrors((prev) => ({
                            ...prev,
                            date: "",
                          }));
                        }}
                        className="bg-transparent outline-none w-full font-inter text-sm text-[#121212] appearance-none"
                      />
                      <div
                        className="cursor-pointer"
                      >
                        <CalendarIcon />
                      </div>
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-xs">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Grade Level */}
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Grade Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                    {state?.schoolGrades?.length > 0 ? state?.schoolGrades?.map((level) => (
                      <button
                        key={level}
                        type="button"
                        id="gradeLevel"
                        onClick={() => {
                          updateField("gradeLevel", level)
                          setErrors((prev) => ({
                            ...prev,
                            gradeLevel: "",
                          }));
                        }}
                        className={`flex items-center justify-center border px-3 py-2 sm:py-[10px] rounded-lg font-inter text-xs sm:text-sm cursor-pointer transition-all ${state.gradeLevel === level
                          ? "bg-[#0B77F9] text-white font-medium"
                          : "bg-[#FCFDFE] text-[#121212] font-medium border-[#B2B2B2]"
                          }`}
                      >
                        {level}
                      </button>
                    )) : GRADE_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        id="gradeLevel"
                        onClick={() => {
                          updateField("gradeLevel", level)
                          setErrors((prev) => ({
                            ...prev,
                            gradeLevel: "",
                          }));
                        }}
                        className={`flex items-center justify-center border px-3 py-2 sm:py-[10px] rounded-lg font-inter text-xs sm:text-sm cursor-pointer transition-all ${state.gradeLevel === level
                          ? "bg-[#0B77F9] text-white font-medium"
                          : "bg-[#FCFDFE] text-[#121212] font-medium border-[#B2B2B2]"
                          }`}
                      >
                        {level}
                      </button>
                    ))}

                  </div>
                  {errors.gradeLevel && (
                    <p className="text-red-500 text-xs mt-1">{errors.gradeLevel}</p>
                  )}
                </div>
              </section>

              <div className="h-px bg-black opacity-10" />

              {/* ── Ratings ── */}
              <section className="flex flex-col gap-5 sm:gap-6" id="ratings">
                <h2 className={`${sectionHeading} text-[#0171F9] text-lg sm:text-xl`}>Ratings</h2>
                <div className="flex flex-col gap-3 sm:gap-4" >
                  {RATING_CATEGORIES.map(({ label, key }) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                      <span className="flex-1 font-outfit text-sm sm:text-base font-medium text-[#121212] leading-6">{label}</span>
                      <StarRating value={state.ratings[key]} onChange={(val) => setRating(key as RatingKeys, val)} />
                    </div>
                  ))}
                  {errors.ratings && (
                    <p className="text-red-500 text-xs">{errors.ratings}</p>
                  )}
                </div>
              </section>

              <div className="h-px bg-black opacity-10" />

              {/* ── Your Experience ── */}
              <section className="flex flex-col gap-5 sm:gap-8">
                <h2 className={`${sectionHeading} text-[#0171F9] text-lg sm:text-xl`}>Your Experience</h2>

                {/* Feedback textarea */}
                <div className="flex flex-col gap-2">
                  <label className={fieldLabel}>Write Feedback</label>
                  <textarea
                    id="feedback"
                    className="h-[102px] px-4 pt-[13px] pb-[14px] rounded-lg bg-[#F3F4F5] font-inter text-sm text-[#6B7280] placeholder-[#6B7280] resize-none outline-none"
                    placeholder="Enter your feedback here"
                    value={state.feedback}
                    onChange={(e) => {
                      updateField("feedback", e.target.value)
                      setErrors((prev) => ({
                        ...prev,
                        feedback: "",
                      }));
                    }}
                  />

                  {errors.feedback && (
                    <p className="text-red-500 text-xs">{errors.feedback}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-end gap-1">
                    <span className={fieldLabel}>Tags</span>
                    <span className="font-outfit text-sm font-light text-[#121212]/56 leading-6">(Select all that apply)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-[9px]" id="selectedTags">
                    {ALL_TAGS.map((tag) => {
                      const isSelected = state.selectedTags.includes(tag);
                      const isNeg = NEGATIVE_TAGS.has(tag);

                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            dispatch({ type: "TOGGLE_TAG", tag })
                            setErrors((prev) => ({
                              ...prev,
                              selectedTags: "",
                            }));
                          }}
                          className={`flex items-center justify-center px-3 sm:px-[19px] py-2 sm:py-[9px] rounded-xl font-inter text-xs sm:text-sm cursor-pointer transition-all ${isSelected && !isNeg
                            ? "border border-[#0171F9] bg-[#EFF6FF] text-[#0171F9]"
                            : isSelected && isNeg
                              ? "border border-[#EF4444] bg-red-50 text-[#EF4444]"
                              : "border border-[#E0E0E2] bg-[#F3F4F6] text-[#121212]"
                            }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                    {errors.selectedTags && (
                      <p className="text-red-500 text-xs ">{errors.selectedTags}</p>
                    )}
                  </div>
                </div>
              </section>

              <div className="h-px bg-black opacity-10" />

              {/* ── Final Thoughts ── */}
              <section className="flex flex-col gap-5 sm:gap-8">
                <h2 className={`${sectionHeading} text-[#0171F9] text-lg sm:text-xl`}>Final Thoughts</h2>

                {/* Return to school + teacher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="returnToSchool">
                  <div className="flex flex-col gap-2">
                    <label className={fieldLabel}>Would you return to this school</label>
                    <ReturnChoiceGroup value={state.returnToSchool}
                      onChange={(val) => {
                        updateField("returnToSchool", val)
                        setErrors((prev) => ({
                          ...prev,
                          returnToSchool: "",
                        }));
                      }} />
                    <input
                      type="text"
                      className={`${inputBase} w-full py-[10px]`}
                      placeholder="Any Comments...."
                      value={state.schoolComment}
                      onChange={(e) => updateField("schoolComment", e.target.value)}
                    />
                    {errors.returnToSchool && (
                      <p className="text-red-500 text-xs mt-1">{errors.returnToSchool}</p>
                    )}

                  </div>
                  <div className="flex flex-col gap-2" id="returnToTeacher">
                    <label className={fieldLabel}>Would you return for this teacher or class</label>
                    <ReturnChoiceGroup value={state.returnToTeacher} onChange={(val) => {
                      updateField("returnToTeacher", val)

                      setErrors((prev) => ({
                        ...prev,
                        returnToTeacher: "",
                      }));
                    }} />
                    <input
                      type="text"
                      className={`${inputBase} w-full py-[10px]`}
                      placeholder="Any Comments...."
                      value={state.teacherComment}
                      onChange={(e) => updateField("teacherComment", e.target.value)}
                    />
                    {errors.returnToTeacher && (
                      <p className="text-red-500 text-xs">{errors.returnToTeacher}</p>
                    )}

                  </div>
                </div>

                {/* postAs */}
                <div className="flex flex-col gap-2" id="postAs">
                  <label className={fieldLabel}>Post As</label>
                  <div className="flex p-[6px] gap-[10px] rounded-lg bg-[#F3F4F5] w-fit overflow-x-auto">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "SET_FIELD", field: "postAs", value: "anonymous" })
                      }
                      className={`flex items-center gap-[6px] px-4 py-[13px] rounded-lg cursor-pointer transition-all ${state.postAs === "anonymous"
                        ? "bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.08)]"
                        : "bg-transparent"
                        }`}
                    >
                      <AnonymousIcon active={state.postAs === "anonymous"} />
                      <span
                        className={`font-inter text-sm leading-none ${state.postAs === "anonymous"
                          ? "text-[#121212]"
                          : "text-[#6B7280]"
                          }`}
                      >
                        Anonymous
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "SET_FIELD", field: "postAs", value: "show" })
                      }
                      className={`flex items-center gap-[6px] px-4 py-[13px] rounded-lg cursor-pointer transition-all ${state.postAs === "show"
                        ? "bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.08)]"
                        : "bg-transparent"
                        }`}
                    >
                      <UserIcon active={state.postAs === "show"} />
                      <span
                        className={`font-inter text-sm leading-none ${state.postAs === "show"
                          ? "text-[#121212]"
                          : "text-[#6B7280]"
                          }`}
                      >
                        Show Name
                      </span>
                    </button>

                    {errors.postAs && (
                      <p className="text-red-500 text-xs ">{errors.postAs}</p>
                    )}

                  </div>{state?.postAs === "show" && <input
                    type="text"
                    className={`${inputBase} w-full py-[10px]`}
                    placeholder="Your Name"
                    value={state.postAs == "show" ? state.yourName : ""}
                    onChange={(e) => updateField("yourName", state.postAs != "anonymous" ? e.target.value : "")}
                  />}
                </div>

                    {/* yourIdentity */}
                {/* <div className="flex flex-col gap-2" id="yourIdentity">
                  <label className={fieldLabel}>Your Identity</label>
                  <div className="flex flex-row gap-5">
                    <input
                      type="text"
                      className={`${inputBase} py-[10px] w-[40%]`}
                      placeholder="Enter New Code"
                      value={state.newIdentity ? state.newIdentity : ""}
                      onChange={(e) => updateField("newIdentity", e.target.value)}
                    />
                    <span className="text-sm min-h-[30px] text-center flex justify-start items-center font-outfit font-medium text-[#121212]">Or</span>
                    <input
                      type="text"
                      className={`${inputBase} py-[10px]  w-[40%]`}
                      placeholder="Enter Existing Code"
                      value={state.existingIdentity ? state.existingIdentity : ""}
                      onChange={(e) => updateField("existingIdentity", e.target.value)}
                    /></div>
                  {errors.yourIdentity && (
                    <p className="text-red-500 text-sm">{errors.yourIdentity}</p>
                  )}
                  <span className="text-sm text-[#ef4444] mt-1">
                    <b>Important Note:</b> Use the same Identity Code for future report submissions and to view all your submitted reports together. This code remains private.
                  </span>
                </div> */}
              </section>

              <div className="h-px bg-black opacity-10" />

              {/* Bottom warning + submit */}
              <div className="flex flex-col gap-6">
                <WarningBanner />

                <div className="flex flex-col justify-end gap-3 sm:gap-4 items-end">
                  <p className="font-inter w-full text-xs sm:text-sm text-[#121212]/60 sm:text-right text-center">
                    Once submitted, reports cannot be edited or undone.
                  </p>
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2 sm:gap-[10px]">
                    <button
                      type="button"
                      className="flex h-[48px] sm:h-[52px] px-6 sm:px-8 items-center justify-center gap-2 rounded-xl border border-black/20 bg-white font-inter text-sm sm:text-base font-medium text-[#2C3031] cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex h-[48px] sm:h-[52px] px-6 sm:px-8 items-center justify-center gap-2 rounded-xl font-inter text-sm sm:text-base font-semibold text-white transition-colors ${isSubmitting
                        ? "bg-[#0171F9]/70 cursor-not-allowed opacity-75"
                        : "bg-[#0171F9] cursor-pointer hover:bg-blue-700"
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          Submit Report
                          <SendIcon />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
