"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronLeftIcon, ChevronRightIcon, DeleteWarningIcon } from "@/lib/icons";

// ─── Icon Components ──────────────────────────────────────────────────────────

const SentimentSmileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_teachers_smile)">
      <path d="M9.53792 6C9.66836 6.20146 9.84979 6.3676 10.0652 6.48277C10.2805 6.59795 10.5227 6.65839 10.769 6.65839C11.0152 6.65839 11.2574 6.59795 11.4728 6.48277C11.6881 6.3676 11.8696 6.20146 12 6M6.46144 6C6.33097 6.20132 6.14956 6.36733 5.93426 6.48242C5.71897 6.59751 5.47687 6.65789 5.23072 6.65789C4.98457 6.65789 4.74247 6.59751 4.52718 6.48242C4.31188 6.36733 4.13047 6.20132 4 6M4.30752 9.62581C4.61131 10.3289 5.12406 10.9296 5.78115 11.352C6.43825 11.7745 7.21029 12 8 12C8.78971 12 9.56175 11.7745 10.2188 11.352C10.8759 10.9296 11.3887 10.3289 11.6925 9.62581" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.00033 15.3337C12.0503 15.3337 15.3337 12.0503 15.3337 8.00033C15.3337 3.95033 12.0503 0.666992 8.00033 0.666992C3.95033 0.666992 0.666992 3.95033 0.666992 8.00033C0.666992 12.0503 3.95033 15.3337 8.00033 15.3337Z" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_teachers_smile"><rect width="16" height="16" fill="white" /></clipPath>
    </defs>
  </svg>
);

const FilterFunnelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.9848 3.19692C13.9848 2.778 13.9848 2.56854 13.9025 2.40845C13.831 2.26781 13.7168 2.15339 13.5763 2.08154C13.4163 2 13.2068 2 12.7879 2H3.21254C2.79362 2 2.58416 2 2.42407 2.08154C2.28332 2.15326 2.16888 2.2677 2.09717 2.40845C2.01563 2.56854 2.01562 2.778 2.01562 3.19692V3.74825C2.01562 3.93152 2.01562 4.02279 2.03657 4.10882C2.05489 4.18541 2.08518 4.25862 2.12634 4.32576C2.17197 4.40057 2.23705 4.46565 2.36572 4.59507L6.15322 8.38181C6.28263 8.51123 6.34772 8.57631 6.39335 8.65112C6.43474 8.71894 6.46466 8.79126 6.48312 8.86806C6.50406 8.95334 6.50406 9.04386 6.50406 9.22265V12.7805C6.50406 13.4216 6.50406 13.7425 6.63872 13.9355C6.69714 14.019 6.77199 14.0896 6.85869 14.1432C6.94539 14.1967 7.04211 14.2319 7.14292 14.2467C7.37557 14.2811 7.66283 14.1382 8.23585 13.851L8.83431 13.5517C9.07519 13.4321 9.19488 13.3722 9.28241 13.2824C9.36005 13.2031 9.41907 13.1076 9.45521 13.0027C9.49636 12.8845 9.49636 12.7498 9.49636 12.4813V9.22863C9.49636 9.04535 9.49636 8.95409 9.5173 8.86806C9.53562 8.79147 9.56592 8.71826 9.60707 8.65112C9.65195 8.57631 9.71704 8.51198 9.84421 8.3848L9.8472 8.38181L13.6347 4.59507C13.7634 4.46565 13.8277 4.40057 13.8741 4.32576C13.9155 4.25793 13.9454 4.18562 13.9638 4.10882C13.9848 4.02429 13.9848 3.93302 13.9848 3.75423V3.19692Z" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownSmallIcon = () => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.91753 4.91753C4.79251 5.04251 4.62297 5.11272 4.44619 5.11272C4.26942 5.11272 4.09988 5.04251 3.97486 4.91753L0.203526 1.14619C0.139852 1.08469 0.0890639 1.01113 0.0541246 0.929795C0.0191852 0.848459 0.000794382 0.760979 2.51709e-05 0.67246C-0.00074404 0.58394 0.0161239 0.496154 0.0496445 0.414223C0.0831651 0.332292 0.132667 0.257857 0.195262 0.195262C0.257857 0.132667 0.332292 0.0831648 0.414223 0.0496442C0.496154 0.0161236 0.58394 -0.00074404 0.67246 2.51714e-05C0.760979 0.000794382 0.848459 0.0191852 0.929795 0.0541246C1.01113 0.0890639 1.08469 0.139852 1.14619 0.203525L4.44619 3.50353L7.74619 0.203525C7.87193 0.0820866 8.04033 0.0148904 8.21513 0.0164093C8.38992 0.0179282 8.55713 0.0880407 8.68074 0.211646C8.80434 0.335252 8.87446 0.50246 8.87598 0.677258C8.87749 0.852056 8.8103 1.02046 8.68886 1.14619L4.91753 4.91753Z" fill="#1E1E1E" />
  </svg>
);

const AddCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M7.99967 1.3335C4.31967 1.3335 1.33301 4.32016 1.33301 8.00016C1.33301 11.6802 4.31967 14.6668 7.99967 14.6668C11.6797 14.6668 14.6663 11.6802 14.6663 8.00016C14.6663 4.32016 11.6797 1.3335 7.99967 1.3335ZM10.6663 8.66683H8.66634V10.6668C8.66634 11.0335 8.36634 11.3335 7.99967 11.3335C7.63301 11.3335 7.33301 11.0335 7.33301 10.6668V8.66683H5.33301C4.96634 8.66683 4.66634 8.36683 4.66634 8.00016C4.66634 7.6335 4.96634 7.3335 5.33301 7.3335H7.33301V5.3335C7.33301 4.96683 7.63301 4.66683 7.99967 4.66683C8.36634 4.66683 8.66634 4.96683 8.66634 5.3335V7.3335H10.6663C11.033 7.3335 11.333 7.6335 11.333 8.00016C11.333 8.36683 11.033 8.66683 10.6663 8.66683Z" fill="#0171F9" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5.8335 17.5C5.37516 17.5 4.98294 17.3369 4.65683 17.0108C4.33072 16.6847 4.16738 16.2922 4.16683 15.8333V5H3.3335V3.33333H7.50016V2.5H12.5002V3.33333H16.6668V5H15.8335V15.8333C15.8335 16.2917 15.6704 16.6842 15.3443 17.0108C15.0182 17.3375 14.6257 17.5006 14.1668 17.5H5.8335ZM14.1668 5H5.8335V15.8333H14.1668V5ZM7.50016 14.1667H9.16683V6.66667H7.50016V14.1667ZM10.8335 14.1667H12.5002V6.66667H10.8335V14.1667Z" fill="#34373F" />
  </svg>
);


const BackArrowIcon = () => (
  <svg width="20" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.49202 9.04802L8.52603 14.2183C8.7315 14.4294 8.83013 14.6756 8.82191 14.9569C8.81369 15.2383 8.7065 15.4845 8.50035 15.6955C8.29488 15.889 8.05516 15.9903 7.7812 15.9994C7.50724 16.0086 7.26753 15.9073 7.06206 15.6955L0.281557 8.73147C0.178822 8.62596 0.10588 8.51165 0.0627314 8.38854C0.0195827 8.26544 -0.00130658 8.13355 6.32218e-05 7.99286C0.00143302 7.85217 0.0230071 7.72027 0.0647859 7.59717C0.106565 7.47407 0.179165 7.35976 0.282584 7.25424L7.06309 0.290169C7.25143 0.0967228 7.48704 0 7.7699 0C8.05277 0 8.29659 0.0967228 8.50138 0.290169C8.70685 0.501202 8.80958 0.751979 8.80958 1.0425C8.80958 1.33302 8.70685 1.58345 8.50138 1.79378L3.49202 6.9377H22.9726C23.2637 6.9377 23.5079 7.03899 23.7051 7.24158C23.9024 7.44417 24.0007 7.6946 24 7.99286C23.9993 8.29112 23.9007 8.54189 23.7041 8.74519C23.5076 8.94848 23.2637 9.04943 22.9726 9.04802H3.49202Z" fill="#1E1E1E" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.16667 15.8333H5.35417L13.5 7.6875L12.3125 6.5L4.16667 14.6458V15.8333ZM3.33333 17.5C3.09722 17.5 2.89944 17.42 2.74 17.26C2.58056 17.1 2.50056 16.9022 2.5 16.6667V14.6458C2.5 14.4236 2.54167 14.2117 2.625 14.01C2.70833 13.8083 2.82639 13.6314 2.97917 13.4792L13.5 2.97917C13.6667 2.82639 13.8508 2.70833 14.0525 2.625C14.2542 2.54167 14.4658 2.5 14.6875 2.5C14.9092 2.5 15.1244 2.54167 15.3333 2.625C15.5422 2.70833 15.7228 2.83333 15.875 3L17.0208 4.16667C17.1875 4.31944 17.3089 4.5 17.385 4.70833C17.4611 4.91667 17.4994 5.125 17.5 5.33333C17.5 5.55556 17.4617 5.7675 17.385 5.96917C17.3083 6.17083 17.1869 6.35472 17.0208 6.52083L6.52083 17.0208C6.36806 17.1736 6.19083 17.2917 5.98917 17.375C5.7875 17.4583 5.57583 17.5 5.35417 17.5H3.33333ZM12.8958 7.10417L12.3125 6.5L13.5 7.6875L12.8958 7.10417Z" fill="#333333" />
  </svg>
);

const LocationPinIcon = () => (

  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.39603 5.60426C8.39603 4.05804 7.14366 2.80566 5.59743 2.80566C4.0512 2.80566 2.79883 4.05804 2.79883 5.60426C2.79883 7.15049 4.0512 8.40287 5.59743 8.40287C7.14366 8.40287 8.39603 7.15049 8.39603 5.60426ZM4.19813 5.60426C4.19813 4.83465 4.82781 4.20496 5.59743 4.20496C6.36704 4.20496 6.99673 4.83465 6.99673 5.60426C6.99673 6.37388 6.36704 7.00356 5.59743 7.00356C4.82781 7.00356 4.19813 6.37388 4.19813 5.60426Z" fill="#414141" />
    <path d="M5.19147 13.8671C5.31041 13.951 5.45734 14 5.59727 14C5.7372 14 5.88412 13.958 6.00306 13.8671C6.21296 13.7131 11.2155 10.1099 11.1945 5.5972C11.1945 2.51174 8.68272 0 5.59727 0C2.51181 0 6.58647e-05 2.51174 6.58647e-05 5.5972C-0.0209236 10.1029 4.98158 13.7131 5.19147 13.8671ZM5.59727 1.4063C7.91311 1.4063 9.79517 3.28836 9.79517 5.6042C9.80916 8.71064 6.7237 11.5022 5.59727 12.4188C4.47083 11.5022 1.38537 8.71764 1.39937 5.6042C1.39937 3.28836 3.28143 1.4063 5.59727 1.4063Z" fill="#414141" />
  </svg>

);

const BuildingIcon = () => (

  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5625 12.5625V5.8125L0.5625 6.65625V12.5625H3.5625ZM3.5625 12.5625H9.5625M3.5625 12.5625V2.56275M9.5625 12.5625V5.8125L12.5625 6.65625V12.5625H9.5625ZM9.5625 12.5625V2.56275M11.0625 3.5625L6.5625 0.5625L2.0625 3.5625M5.8125 4.3125H7.3125M5.8125 6.5625H7.3125" stroke="#414141" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);
const TrendUpIcon = () => (
  <svg
    width="10"
    height="14"
    viewBox="0 0 10 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_443_2781)">
      <path
        d="M6.69618 1.4715C6.73275 1.41306 6.78047 1.36239 6.83662 1.32239C6.89278 1.28239 6.95626 1.25384 7.02344 1.23837C7.09063 1.2229 7.16021 1.22082 7.2282 1.23224C7.29619 1.24366 7.36127 1.26836 7.41971 1.30493C7.47816 1.3415 7.52883 1.38922 7.56883 1.44538C7.60883 1.50153 7.63738 1.56501 7.65285 1.63219C7.66832 1.69938 7.6704 1.76896 7.65898 1.83695C7.64756 1.90494 7.62286 1.97002 7.58629 2.02846L6.69618 1.4715ZM6.72181 2.42063L6.27657 2.14242L6.27675 2.14213L6.72181 2.42063ZM5.30564 5.67806C5.23186 5.79615 5.1142 5.88009 4.97853 5.91142C4.84286 5.94275 4.7003 5.9189 4.58222 5.84512C4.46413 5.77134 4.38019 5.65368 4.34886 5.51801C4.31753 5.38234 4.34138 5.23978 4.41516 5.1217L5.30564 5.67806ZM4.41173 5.12719C4.48551 5.0091 4.60317 4.92516 4.73884 4.89383C4.87451 4.8625 5.01707 4.88635 5.13515 4.96013C5.25324 5.03391 5.33718 5.15157 5.36851 5.28724C5.39984 5.42291 5.37599 5.56547 5.30221 5.68355L4.41173 5.12719ZM3.29309 8.89923C3.21931 9.01732 3.10164 9.10126 2.96598 9.13259C2.83031 9.16392 2.68775 9.14007 2.56966 9.06629C2.45158 8.99251 2.36764 8.87485 2.33631 8.73918C2.30498 8.60351 2.32883 8.46095 2.40261 8.34287L3.29309 8.89923ZM7.58629 2.02846L7.57933 2.03957L6.68913 1.48277L6.69618 1.4715L7.58629 2.02846ZM7.57933 2.03957L7.49681 2.17167L6.60679 1.61464L6.68913 1.48277L7.57933 2.03957ZM7.49681 2.17167L7.41447 2.30348L6.52435 1.74645L6.60679 1.61464L7.49681 2.17167ZM7.41447 2.30348L7.33179 2.43549L6.44177 1.87844L6.52435 1.74645L7.41447 2.30348ZM7.33179 2.43549L7.2493 2.56717L6.35919 2.01015L6.44177 1.87844L7.33179 2.43549ZM7.2493 2.56717L7.16686 2.69909L6.27675 2.14213L6.35919 2.01015L7.2493 2.56717ZM7.16705 2.6988L5.30564 5.67806L4.41516 5.1217L6.27657 2.14242L7.16705 2.6988ZM5.30221 5.68355L3.29309 8.89923L2.40261 8.34287L4.41173 5.12719L5.30221 5.68355Z"
        fill="#16A34A"
      />
      <path
        d="M1.46753 2.62246L6.57409 1.44338C6.69165 1.41623 6.81341 1.41249 6.93242 1.43241C7.05143 1.45234 7.16535 1.49554 7.26767 1.5594C7.37 1.62326 7.45874 1.7068 7.52881 1.80504C7.59888 1.90328 7.64891 2.01427 7.67606 2.13183L8.85518 7.23839"
        stroke="#16A34A"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    <defs>
      <clipPath id="clip0_443_2781">
        <rect
          width="10"
          height="14"
          fill="white"
          transform="matrix(1 0 0 -1 0 14)"
        />
      </clipPath>
    </defs>
  </svg>
);
const TrendDownIcon = () => (

  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_443_2781)">
      <path d="M6.69618 12.5285C6.73275 12.5869 6.78047 12.6376 6.83662 12.6776C6.89278 12.7176 6.95626 12.7462 7.02344 12.7616C7.09063 12.7771 7.16021 12.7792 7.2282 12.7678C7.29619 12.7564 7.36127 12.7317 7.41971 12.6951C7.47816 12.6585 7.52883 12.6108 7.56883 12.5546C7.60883 12.4985 7.63738 12.435 7.65285 12.3678C7.66832 12.3006 7.6704 12.2311 7.65898 12.1631C7.64756 12.0951 7.62286 12.03 7.58629 11.9715L6.69618 12.5285ZM6.72181 11.5794L6.27657 11.8576L6.27675 11.8579L6.72181 11.5794ZM5.30564 8.32194C5.23186 8.20385 5.1142 8.11991 4.97853 8.08858C4.84286 8.05725 4.7003 8.0811 4.58222 8.15488C4.46413 8.22866 4.38019 8.34632 4.34886 8.48199C4.31753 8.61766 4.34138 8.76022 4.41516 8.8783L5.30564 8.32194ZM4.41173 8.87281C4.48551 8.9909 4.60317 9.07484 4.73884 9.10617C4.87451 9.1375 5.01707 9.11365 5.13515 9.03987C5.25324 8.96609 5.33718 8.84843 5.36851 8.71276C5.39984 8.57709 5.37599 8.43453 5.30221 8.31645L4.41173 8.87281ZM3.29309 5.10077C3.21931 4.98268 3.10164 4.89874 2.96598 4.86741C2.83031 4.83608 2.68775 4.85993 2.56966 4.93371C2.45158 5.00749 2.36764 5.12515 2.33631 5.26082C2.30498 5.39649 2.32883 5.53905 2.40261 5.65713L3.29309 5.10077ZM7.58629 11.9715L7.57933 11.9604L6.68913 12.5172L6.69618 12.5285L7.58629 11.9715ZM7.57933 11.9604L7.49681 11.8283L6.60679 12.3854L6.68913 12.5172L7.57933 11.9604ZM7.49681 11.8283L7.41447 11.6965L6.52435 12.2535L6.60679 12.3854L7.49681 11.8283ZM7.41447 11.6965L7.33179 11.5645L6.44177 12.1216L6.52435 12.2535L7.41447 11.6965ZM7.33179 11.5645L7.2493 11.4328L6.35919 11.9898L6.44177 12.1216L7.33179 11.5645ZM7.2493 11.4328L7.16686 11.3009L6.27675 11.8579L6.35919 11.9898L7.2493 11.4328ZM7.16705 11.3012L5.30564 8.32194L4.41516 8.8783L6.27657 11.8576L7.16705 11.3012ZM5.30221 8.31645L3.29309 5.10077L2.40261 5.65713L4.41173 8.87281L5.30221 8.31645Z" fill="#E02C2C" />
      <path d="M1.46753 11.3775L6.57409 12.5566C6.69165 12.5838 6.81341 12.5875 6.93242 12.5676C7.05143 12.5477 7.16535 12.5045 7.26767 12.4406C7.37 12.3767 7.45874 12.2932 7.52881 12.195C7.59888 12.0967 7.64891 11.9857 7.67606 11.8681L8.85518 6.76155" stroke="#E02C2C" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_443_2781">
        <rect width="10" height="14" fill="white" transform="matrix(1 0 0 -1 0 14)" />
      </clipPath>
    </defs>
  </svg>

);

const TeacherIdIcon = () => (
  <svg width="15" height="15" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M7.39539 7.41538C7.5097 7.45906 7.60199 7.54635 7.65195 7.65806C7.70192 7.76976 7.70548 7.89674 7.66185 8.01107C7.26862 9.03999 6.67047 9.60738 5.94431 9.89168C5.27231 10.1538 4.5277 10.1538 3.88585 10.1538H3.84585C3.15662 10.1538 2.57816 10.16 2.08339 10.3532C1.62862 10.5305 1.20462 10.8861 0.892625 11.7034C0.848884 11.8177 0.761519 11.91 0.649747 11.9599C0.537976 12.0098 0.410954 12.0133 0.296625 11.9695C0.182297 11.9258 0.0900263 11.8384 0.0401128 11.7267C-0.00980069 11.6149 -0.0132688 11.4879 0.0304715 11.3735C0.423087 10.3446 1.02124 9.77722 1.74739 9.49292C2.42001 9.23076 3.16462 9.23076 3.80585 9.23076H3.84585C4.53508 9.23076 5.11354 9.22461 5.60831 9.03138C6.0637 8.85415 6.4877 8.49845 6.7997 7.68122C6.84338 7.56691 6.93067 7.47463 7.04237 7.42466C7.15408 7.37469 7.28106 7.37175 7.39539 7.41538ZM7.19847 0H9.72585C10.4231 0 10.9929 3.35276e-08 11.4428 0.0603077C11.9129 0.123692 12.3203 0.260307 12.6458 0.585846C12.9708 0.911384 13.1074 1.31815 13.1708 1.78892C13.2311 2.23815 13.2311 2.808 13.2311 3.50584V4.80246C13.2311 5.49969 13.2311 6.06892 13.1708 6.51938C13.108 6.98892 12.9708 7.3963 12.6458 7.72184C12.3209 8.04738 11.9129 8.18399 11.4428 8.24738C10.9929 8.30769 10.4231 8.30769 9.72585 8.30769H8.76893C8.64652 8.30769 8.52912 8.25906 8.44257 8.1725C8.35601 8.08595 8.30739 7.96856 8.30739 7.84615C8.30739 7.72374 8.35601 7.60635 8.44257 7.51979C8.52912 7.43324 8.64652 7.38461 8.76893 7.38461H9.69262C10.4311 7.38461 10.9388 7.38338 11.3197 7.3323C11.6871 7.28307 11.8674 7.19446 11.9929 7.06892C12.1185 6.94399 12.2065 6.76369 12.2563 6.39569C12.3074 6.01476 12.3086 5.50769 12.3086 4.76923V3.53846C12.3086 2.8 12.3074 2.29292 12.2563 1.912C12.2071 1.544 12.1185 1.36431 11.9929 1.23877C11.8674 1.11323 11.6871 1.02461 11.3197 0.975384C10.9382 0.924307 10.4311 0.923076 9.69323 0.923076H7.2317C6.49324 0.923076 5.98554 0.924307 5.60462 0.975384C5.23724 1.02461 5.05693 1.11323 4.93139 1.23877C4.82431 1.34585 4.74554 1.49169 4.69385 1.75569C4.6397 2.03261 4.62185 2.4 4.61754 2.92677C4.61706 2.98738 4.60464 3.0473 4.581 3.10311C4.55736 3.15892 4.52295 3.20953 4.47975 3.25204C4.43655 3.29456 4.3854 3.32815 4.32922 3.35089C4.27304 3.37364 4.21292 3.3851 4.15231 3.38461C4.0917 3.38413 4.03178 3.37171 3.97597 3.34807C3.92016 3.32442 3.86955 3.29002 3.82704 3.24682C3.78452 3.20362 3.75093 3.15247 3.72819 3.09629C3.70544 3.0401 3.69398 2.97999 3.69447 2.91938C3.69878 2.39569 3.71539 1.94892 3.78801 1.57784C3.86308 1.19446 4.00401 0.860307 4.27847 0.585846C4.60462 0.260307 5.01139 0.123692 5.48154 0.0603077C5.93139 3.35276e-08 6.50124 0 7.19847 0Z" fill="#121212" fillRule="evenodd"></path><path fillRule="evenodd" clipRule="evenodd" d="M3.84564 5.23126C3.56002 5.23126 3.2861 5.34473 3.08414 5.54669C2.88218 5.74865 2.76872 6.02257 2.76872 6.30819C2.76872 6.5938 2.88218 6.86772 3.08414 7.06969C3.2861 7.27165 3.56002 7.38511 3.84564 7.38511C4.13126 7.38511 4.40518 7.27165 4.60714 7.06969C4.8091 6.86772 4.92256 6.5938 4.92256 6.30819C4.92256 6.02257 4.8091 5.74865 4.60714 5.54669C4.40518 5.34473 4.13126 5.23126 3.84564 5.23126ZM1.84564 6.30819C1.84564 5.77775 2.05636 5.26905 2.43143 4.89397C2.8065 4.5189 3.31521 4.30819 3.84564 4.30819C4.37607 4.30819 4.88478 4.5189 5.25985 4.89397C5.63492 5.26905 5.84564 5.77775 5.84564 6.30819C5.84564 6.83862 5.63492 7.34733 5.25985 7.7224C4.88478 8.09747 4.37607 8.30818 3.84564 8.30818C3.31521 8.30818 2.8065 8.09747 2.43143 7.7224C2.05636 7.34733 1.84564 6.83862 1.84564 6.30819ZM6.15333 2.92357C6.15333 2.80117 6.20196 2.68377 6.28851 2.59722C6.37507 2.51066 6.49246 2.46204 6.61487 2.46204H10.3072C10.4296 2.46204 10.547 2.51066 10.6335 2.59722C10.7201 2.68377 10.7687 2.80117 10.7687 2.92357C10.7687 3.04598 10.7201 3.16338 10.6335 3.24993C10.547 3.33649 10.4296 3.38511 10.3072 3.38511H6.61487C6.49246 3.38511 6.37507 3.33649 6.28851 3.24993C6.20196 3.16338 6.15333 3.04598 6.15333 2.92357ZM7.99948 5.38511C7.99948 5.2627 8.04811 5.14531 8.13466 5.05875C8.22122 4.9722 8.33861 4.92357 8.46102 4.92357H10.3072C10.4296 4.92357 10.547 4.9722 10.6335 5.05875C10.7201 5.14531 10.7687 5.2627 10.7687 5.38511C10.7687 5.50752 10.7201 5.62491 10.6335 5.71147C10.547 5.79802 10.4296 5.84665 10.3072 5.84665H8.46102C8.33861 5.84665 8.22122 5.79802 8.13466 5.71147C8.04811 5.62491 7.99948 5.50752 7.99948 5.38511Z" fill="#121212"></path></svg>
);

const DotIcon = () => (
  <svg width="4" height="4" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle opacity="0.64" cx="1.5" cy="1.5" r="1.5" fill="#676767" />
  </svg>
);

// ─── Teacher Types & Data ─────────────────────────────────────────────────────

type TeacherRisk = "High" | "Medium" | "Low";

interface Teacher {
  id: number;
  name: string;
  total_reports: number;
  avg_rating: number;
  risk: TeacherRisk;
  status: string;
}

const teacherRiskStyles: Record<TeacherRisk, { bg: string; text: string }> = {
  High: { bg: "bg-[#FFECEC]", text: "text-[#E53E3E]" },
  Medium: { bg: "bg-[#FFF4E0]", text: "text-[#FFA600]" },
  Low: { bg: "bg-[#E6FBF0]", text: "text-[#22A45D]" },
};

// ─── Add Teacher Sidebar ──────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="25" height="25" viewBox="0 0 34 34" fill="none">
    <path d="M17.0001 18.9835L10.0585 25.9251C9.79874 26.1849 9.46819 26.3147 9.0668 26.3147C8.66541 26.3147 8.33485 26.1849 8.07513 25.9251C7.81541 25.6654 7.68555 25.3349 7.68555 24.9335C7.68555 24.5321 7.81541 24.2015 8.07513 23.9418L15.0168 17.0001L8.07513 10.0585C7.81541 9.79874 7.68555 9.46819 7.68555 9.0668C7.68555 8.66541 7.81541 8.33485 8.07513 8.07513C8.33485 7.81541 8.66541 7.68555 9.0668 7.68555C9.46819 7.68555 9.79874 7.81541 10.0585 8.07513L17.0001 15.0168L23.9418 8.07513C24.2015 7.81541 24.5321 7.68555 24.9335 7.68555C25.3349 7.68555 25.6654 7.81541 25.9251 8.07513C26.1849 8.33485 26.3147 8.66541 26.3147 9.0668C26.3147 9.46819 26.1849 9.79874 25.9251 10.0585L18.9835 17.0001L25.9251 23.9418C26.1849 24.2015 26.3147 24.5321 26.3147 24.9335C26.3147 25.3349 26.1849 25.6654 25.9251 25.9251C25.6654 26.1849 25.3349 26.3147 24.9335 26.3147C24.5321 26.3147 24.2015 26.1849 23.9418 25.9251L17.0001 18.9835Z" fill="#212121" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#chevron-clip)">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.47124 10.4712C8.34622 10.5962 8.17668 10.6664 7.9999 10.6664C7.82313 10.6664 7.65359 10.5962 7.52857 10.4712L3.75724 6.6999C3.63580 6.5786 3.56860 6.4102 3.57012 6.2354C3.57164 6.0606 3.64175 5.8934 3.76536 5.7698C3.88896 5.6462 4.05617 5.5761 4.23097 5.5746C4.40577 5.5731 4.57417 5.6403 4.6999 5.7617L7.9999 9.0617L11.2999 5.7617C11.4256 5.6403 11.594 5.5731 11.7688 5.5746C11.9436 5.5761 12.1108 5.6462 12.2344 5.7698C12.3581 5.8934 12.4282 6.0606 12.4297 6.2354C12.4312 6.4102 12.364 6.5786 12.2426 6.6999L8.47124 10.4712Z" fill="#1E1E1E" fillOpacity="0.6" />
    </g>
    <defs>
      <clipPath id="chevron-clip"><rect width="16" height="16" fill="white" /></clipPath>
    </defs>
  </svg>
);

interface AddTeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  onTeacherAdded: () => void;
}

interface EditTeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onTeacherUpdated: () => void;
}

function AddTeacherSidebar({ isOpen, onClose, schoolId, onTeacherAdded }: AddTeacherSidebarProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !status) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          status,
          school_id: schoolId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add teacher");
      }

      onTeacherAdded();
      onClose();
      setName("");
      setStatus("");
    } catch (err) {
      console.error("Error adding teacher:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[524px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-6 pb-6 sm:pb-6">
          <h2 className="font-inter font-semibold text-xl sm:text-[25px] text-[#212121] leading-6">Add Teacher</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/10 mx-0" />

        {/* Form */}
        <div className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-6 pt-6 sm:pt-8">
          {/* Name field */}
          <div className="flex flex-col gap-0.5">
            <label className="font-outfit font-medium text-sm sm:text-base text-[#212121] leading-6">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              disabled={loading}
              className="h-10 sm:h-12 px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter font-normal text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Status field */}
          <div className="flex flex-col gap-0.5">
            <label className="font-outfit font-medium text-sm sm:text-base text-[#212121] leading-6">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => {console.log(e.target.value,"value");setStatus(e.target.value)}}
                disabled={loading}
                className="appearance-none w-full h-10 sm:h-12 px-3 sm:px-4 pr-10 rounded-lg bg-[#F3F4F5] font-inter font-normal text-sm text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select</option>
                <option value="1">Active</option>
                <option value="2">Inactive</option>
              </select>
              <span className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg font-inter text-sm text-[#E02C2C]">
              {error}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center mt-6 sm:mt-8 px-4 sm:px-5 py-3 rounded-lg bg-[#0171F9] font-inter font-semibold text-sm sm:text-md text-white leading-6 hover:bg-[#0161dd] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Edit Teacher Sidebar ──────────────────────────────────────────────────────

function EditTeacherSidebar({ isOpen, onClose, teacher, onTeacherUpdated }: EditTeacherSidebarProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacher) {
      console.log(teacher.status)
      setName(teacher.name);
      setStatus(teacher.status);
    }
  }, [teacher]);

  const handleSave = async () => {
    if (!name.trim() || !status) {
      setError("Please fill in all fields");
      return;
    }

    if (!teacher) {
      setError("Teacher data is missing");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/teachers/${teacher.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update teacher");
      }

      onTeacherUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating teacher:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[524px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-6 pb-6 sm:pb-6">
          <h2 className="font-inter font-semibold text-xl sm:text-[25px] text-[#212121] leading-6">Edit Teacher</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/10 mx-0" />

        {/* Form */}
        <div className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-6 pt-6 sm:pt-8">
          {/* Name field */}
          <div className="flex flex-col gap-0.5">
            <label className="font-outfit font-medium text-sm sm:text-base text-[#212121] leading-6">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              disabled={loading}
              className="h-10 sm:h-12 px-3 sm:px-4 rounded-lg bg-[#F3F4F5] font-inter font-normal text-sm text-[#6B7280] placeholder:text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Status field */}
          <div className="flex flex-col gap-0.5">
            <label className="font-outfit font-medium text-sm sm:text-base text-[#212121] leading-6">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="appearance-none w-full h-10 sm:h-12 px-3 sm:px-4 pr-10 rounded-lg bg-[#F3F4F5] font-inter font-normal text-sm text-[#6B7280] outline-none focus:ring-2 focus:ring-[#0171F9]/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select</option>
                <option value="1">Active</option>
                <option value="2">Inactive</option>
              </select>
              <span className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg font-inter text-sm text-[#E02C2C]">
              {error}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center mt-6 sm:mt-8 px-4 sm:px-5 py-3 rounded-lg bg-[#0171F9] font-inter font-semibold text-sm sm:text-md text-white leading-6 hover:bg-[#0161dd] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────



interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationModal({
  isOpen,
  title,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white rounded-xl shadow-2xl w-auto overflow-hidden transform transition-transform duration-300">
          {/* Content */}
          <div className="px-8 py-8 flex flex-col items-center gap-4">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <DeleteWarningIcon />
            </div>

            {/* Title */}
            <h2 className="font-inter font-bold text-2xl text-[#121212] text-center leading-7">
              {title}
            </h2>

            {/* Message */}
            <p className="font-inter font-normal text-[15px] text-[#666F77] text-center leading-6">
              Are you sure you want to delete this teacher? This action cannot be undone.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E7EB]" />

          {/* Actions */}
          <div className="flex gap-3 px-6 py-4 sm:px-8 sm:py-5 bg-[#F9FAFB]">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border border-[#D1D5DB] bg-white font-inter font-semibold text-sm text-[#374151] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="text-[#fff] flex-1 px-4 py-3 rounded-lg bg-[#E02C2C] font-inter font-semibold text-sm hover:bg-[#CC2424] active:bg-[#B81D1D] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Teachers Tab Component ───────────────────────────────────────────────────

function TeachersTab({ schoolId }: { schoolId: string }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [riskFilter, setRiskFilter] = useState<"All" | TeacherRisk>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editSidebarOpen, setEditSidebarOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<number | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null);
  const [isFirstLoadT, setIsFirstLoadT] = useState<boolean>(true);

  const TEACHERS_PER_PAGE = 5;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        if(isFirstLoadT){
          setLoading(true);
        }
        const params = new URLSearchParams({
          school_id: schoolId,
          page: currentPage.toString(),
          limit: TEACHERS_PER_PAGE.toString(),
          risk: riskFilter === "All" ? "" : riskFilter,
          status: statusFilter === "All" ? "" : statusFilter,
        });

        const response = await fetch(`/api/teachers?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch teachers");
        }

        const data = await response.json();
       
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch teachers");
        }
        setTeachers(data.teachers);
        setTotalPages(data.pagination.totalPages);
        setTotalTeachers(data.pagination.total);

        setError(null);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setIsFirstLoadT(false);
      }
    };

    if (schoolId) {
      fetchTeachers();
    }
  }, [schoolId, currentPage, riskFilter, statusFilter, refreshTrigger]);

  const handleFilterChange = <T,>(setter: (v: T) => void) => (val: T) => {
    setter(val);
    setCurrentPage(1);
  };

  const startItem = totalTeachers === 0 ? 0 : (currentPage - 1) * TEACHERS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * TEACHERS_PER_PAGE, totalTeachers);

  const handleTeacherAdded = () => {
    toast.success("Teacher created successfully");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditSidebarOpen(true);
  };

  const handleTeacherUpdated = () => {
    toast.success("Teacher updated successfully");
    setEditSidebarOpen(false);
    setSelectedTeacher(null);
    setRefreshTrigger((prev) => prev + 1);
  };



  const handleDeleteClick = (teacherId: number) => {
    setTeacherToDelete(teacherId);
    setDeleteModalOpen(true);
  };


  const handleConfirmDelete = async () => {
    if (teacherToDelete === null) {
      return;
    }

    try {
      setDeletingTeacherId(teacherToDelete);
      const response = await fetch(`/api/teachers/${teacherToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to delete teacher");
        throw new Error(data.message || "Failed to delete teacher");
      }
      toast.success("Teacher deleted successfully");

      if (endItem == startItem && currentPage != 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setRefreshTrigger((prev) => prev + 1);
      setDeleteModalOpen(false);
      setTeacherToDelete(null);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete teacher");
    } finally {
      setDeletingTeacherId(null);
    }
  };

  
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTeacherToDelete(null);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <AddTeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        schoolId={schoolId}
        onTeacherAdded={handleTeacherAdded}
      />
      <EditTeacherSidebar
        isOpen={editSidebarOpen}
        onClose={() => {
          setEditSidebarOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
        onTeacherUpdated={handleTeacherUpdated}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Teacher"
       
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deletingTeacherId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Tab header */}
      <div className="flex flex-row items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
        <h3 className="font-outfit font-medium text-lg sm:text-2xl text-[#121212]">Teachers</h3>
        <div className="flex items-center gap-3 sm:gap-4">
          {schoolId === "15680" && (
            <Link
              href="/admin/teachers/import"
              className="font-outfit font-normal text-sm sm:text-[16px] text-[#0171F9] hover:underline whitespace-nowrap"
            >
              Import CSV
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <AddCircleIcon />
            <span className="font-outfit font-normal text-sm sm:text-[16px] text-[#0171F9]">Add New</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="px-4 sm:px-6 py-8 text-center text-[#6F6C70]">
          Loading teachers...
        </div>
      ) : error ? (
        <div className="px-4 sm:px-6 py-8 text-center text-[#E02C2C]">
          {error}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 flex-wrap">
            {/* Risk filter */}
            <div className="relative">

              <select
                value={riskFilter}
                onChange={(e) => handleFilterChange(setRiskFilter)(e.target.value as "All" | TeacherRisk)}
                className="appearance-none flex items-center gap-2.5 pl-9 pr-8 py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
              >
                <option value="All">Risk: All</option>
                <option value="High">Risk: High</option>
                <option value="Medium">Risk: Medium</option>
                <option value="Low">Risk: Low</option>
              </select>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <SentimentSmileIcon />
              </span>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownSmallIcon />
              </span>
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value as "All" | string)}
                className="appearance-none flex items-center gap-2.5 pl-9 pr-8 py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Active">Status: Active</option>
                <option value="Inactive">Status: Inactive</option>
              </select>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <FilterFunnelIcon />
              </span>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownSmallIcon />
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-y border-[#E5E7EB] bg-white">
                  <th className="text-left px-2 sm:px-3 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase tracking-wide">Teacher</th>
                  <th className="text-left px-2 sm:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase tracking-wide">Reports</th>
                  <th className="text-left px-2 sm:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase tracking-wide">Avg Rating</th>
                  <th className="text-left px-2 sm:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase tracking-wide">Risk</th>
                  <th className="text-left px-2 sm:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase tracking-wide">Status</th>
                  <th className="text-left px-2 sm:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-5 py-8 sm:py-10 text-center font-inter text-[12px] sm:text-sm text-[#6F6C70]">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => {
                    const risk = teacherRiskStyles[teacher.risk];
                    return (
                      <tr key={teacher.id} className="border-b border-[#F2F4F7] hover:bg-[#F8FAFF] transition-colors">
                        {/* Name */}
                        <td className="px-2 sm:px-3 py-3 sm:py-[17.5px]">
                          <span className="font-inter font-normal text-[12px] sm:text-[13px] text-[#030711] leading-5">
                            {teacher.name}
                          </span>
                        </td>
                        {/* Reports */}
                        <td className="px-2 sm:px-5 py-3 sm:py-[17.5px] whitespace-nowrap">
                          <span className="font-inter font-normal text-[12px] sm:text-[13px] text-[#030711] ">
                            {teacher.total_reports || 0}
                          </span>
                        </td>
                        {/* Avg Rating */}
                        <td className="px-2 sm:px-5 py-3 sm:py-[17.5px] whitespace-nowrap">
                          <span className="font-inter font-normal text-[12px] sm:text-[13px] text-[#030711]">
                            {teacher.total_reports > 0 ? <>{Number(teacher.avg_rating)}<span className="text-[#9CA3AF]">/5</span></> : "N/A"}
                          </span>
                        </td>
                        {/* Risk badge */}
                        {teacher.total_reports > 0 ? <td className="px-2 sm:px-5 py-3 sm:py-[17.5px] whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2 sm:px-2.5 py-1 rounded-md font-inter font-medium text-[10px] sm:text-xs ${risk?.bg} ${risk?.text}`}>
                            {teacher.risk}
                          </span>
                        </td>
                          :
                          <td className="px-2 sm:px-5 py-3 sm:py-[17.5px] whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center px-2 sm:px-2.5 py-1 rounded-md font-inter font-medium text-[10px] sm:text-xs bg-[#F6F6F6] text-[#030711]`}>
                              Not sure
                            </span>
                          </td>
                        }
                        {/* Status */}
                        <td className="px-2 sm:px-5 py-3 sm:py-[17.5px] whitespace-nowrap">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md border border-[#EFF0F2] bg-[#F6F6F6] font-inter font-normal text-[11px] sm:text-xs text-[#030711]">
                            {teacher.status == "1" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="flex gap-2 px-2 sm:px-5 py-3 sm:py-[17.5px] whitespace-nowrap">
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md border border-[#EFF0F2] bg-white hover:bg-gray-50 transition-colors cursor-pointer" title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(teacher.id)}
                            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md border border-[#EFF0F2] bg-white hover:bg-gray-50 transition-colors cursor-pointer" title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-8 py-4 sm:py-5">
            <span className="font-inter font-normal text-xs sm:text-sm text-[#191C1E] opacity-80">
              {totalTeachers === 0
                ? "Show 0 results"
                : `Show ${startItem}-${endItem} of ${totalTeachers}`}
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ChevronLeftIcon />
              </button>
              {Array.from(
                {
                  length: Math.min(4, totalPages),
                },
                (_, i) => {
                  let startPage: number;
                  if (totalPages <= 4) {
                    startPage = 1;
                  } else if (currentPage <= 2) {
                    startPage = 1;
                  } else if (currentPage > totalPages - 2) {
                    startPage = totalPages - 3;
                  } else {
                    startPage = currentPage - 1;
                  }
                  return startPage + i;
                }
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-xs sm:text-[15px] transition-colors cursor-pointer ${currentPage === page
                      ? "bg-[#0171F9] text-white font-semibold"
                      : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportSentiment = "Positive" | "Negative" | "Neutral";
type ReportStatus = "Pending" | "Approved" | "Rejected";
type ReturnAnswer = "Yes" | "No" | "Maybe";

interface SchoolReport {
  id: string;
  grade: string;
  teacher: string;
  date: string;
  sentiment: ReportSentiment;
  status: ReportStatus;
  quote: string;
  schoolReturn: ReturnAnswer;
  teacherReturn: ReturnAnswer;
}


// ─── Helper Styles ────────────────────────────────────────────────────────────

function getSentimentStyle(sentiment: ReportSentiment) {
  switch (sentiment) {
    case "Positive": return "bg-[#BBFBE6] text-[#2D7D65]";
    case "Negative": return "bg-[#FEEFEF] text-[#E02C2C]";
    default: return "bg-[#FFF4E0] text-[#FFA600]";
  }
}

function getStatusStyle(status: ReportStatus) {
  switch (status) {
    case "Approved": return "bg-[#BBFBE6] text-[#2D7D65]";
    case "Rejected": return "bg-[#FEEFEF] text-[#E02C2C]";
    default: return "bg-[#FFF4E0] text-[#FFA600]";
  }
}

function getReturnStyle(answer: ReturnAnswer) {
  switch (answer) {
    case "Yes": return "bg-[#BBFBE6] text-[#2D7D65]";
    case "No": return "bg-[#FEEFEF] text-[#E02C2C]";
    default: return "bg-[#FFF4E0] text-[#FFA600]";
  }
}

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report, isLast }: { report: SchoolReport; isLast: boolean }) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 py-4 sm:py-5 px-4 sm:px-6 ${!isLast ? "border-b border-[#EFEFEF]" : ""}`}>
      {/* Top row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-3 lg:gap-5 flex-wrap">
        <div className="flex flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
          <span className="font-inter font-bold text-base sm:text-[17px] text-[#0171F9] leading-5">{report.id}</span>
          <span className="font-inter font-medium text-xs sm:text-sm text-[#121212] opacity-70 leading-5">{report.grade}</span>
          <div className="hidden sm:block"><DotIcon /></div>
          <div className="flex items-center gap-1.5">
            <TeacherIdIcon />
            <span className="font-inter font-medium text-xs sm:text-sm text-[#121212] opacity-70">{report.teacher}</span>
          </div>
          <div className="hidden sm:block"><DotIcon /></div>
          <span className="font-inter font-medium text-xs sm:text-sm text-[#121212] opacity-70 leading-5">{report.date}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-2.5 py-1 rounded-md font-inter font-semibold text-xs leading-[15px] ${getSentimentStyle(report.sentiment)}`}>
            {report.sentiment}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-inter font-semibold text-xs leading-[15px] ${getStatusStyle(report.status)}`}>
            {report.status}
          </span>
        </div>
      </div>

      {/* Quote */}
      <p className="font-inter font-normal text-sm sm:text-[16px] italic text-[#464555] leading-5">{report.quote}</p>

      {/* Return badges */}
      <div className="flex flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
        <span className={`w-fit px-2.5 py-1.5 rounded-md font-inter font-medium text-xs leading-[15px] ${getReturnStyle(report.schoolReturn)}`}>
          School: {report.schoolReturn}
        </span>
        <span className={`w-fit px-2.5 py-1.5 rounded-md font-inter font-medium text-xs leading-[15px] ${getReturnStyle(report.teacherReturn)}`}>
          Teacher: {report.teacherReturn}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface SchoolData {
  id: number;
  school_name: string;
  reports_this_month: number;
  reports_last_month: number;
  return_to_school_maybe_percentage: string,
  return_to_school_no_percentage: string,
  return_to_school_yes_percentage: string,
  return_to_teacher_maybe_percentage: string,
  return_to_teacher_no_percentage: string,
  return_to_teacher_yes_percentage: string,
  school_district_name: string;
  school_association: string;
  city: string;
  state: string;
  avg_rating: number;
  calculated_risk: string;
  teacher_count: number;
  total_reports: number;
  school_year: string;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params.id as string;

  const [activeTab, setActiveTab] = useState<"Reports" | "Teachers">("Reports");
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [reports, setReports] = useState<SchoolReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const REPORTS_PER_PAGE = 5;

  function StarRating({ count = 0 }: { count?: number }) {
    const STAR_SIZE = 20; // increase size
    const GAP = 1;

    return (
      <svg
        width={(STAR_SIZE + GAP) * 5}
        height={STAR_SIZE}
        viewBox={`0 0 ${(STAR_SIZE + GAP) * 5} ${STAR_SIZE}`}
        fill="none"
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const x = i * (STAR_SIZE + GAP);

          const fillPercent = Math.max(0, Math.min(1, count - i));

          return (
            <g
              key={i}
              transform={`translate(${x}, 0) scale(${STAR_SIZE / 13})`}
            >
              {/* Empty star */}
              <path
                d="M7.89844 4.36816L8.00781 4.62012L8.28125 4.64258L11.8516 4.94336L9.16113 7.21094L8.94434 7.39355L9.00977 7.66992L9.81641 11.0576L6.73242 9.25L6.5 9.11426L6.26758 9.25L3.18262 11.0576L3.99023 7.66992L4.05566 7.39355L3.83887 7.21094L1.14746 4.94336L4.71875 4.64258L4.99219 4.62012L5.10156 4.36816L6.5 1.15332L7.89844 4.36816Z"
                fill="#E2E8F0"
                stroke="#E2E8F0"
                strokeWidth="0.92"
              />

              {/* Partial filled star */}
              <clipPath id={`clip-${i}`}>
                <rect
                  x="0"
                  y="0"
                  width={13 * fillPercent}
                  height="13"
                />
              </clipPath>

              <path
                clipPath={`url(#clip-${i})`}
                d="M7.89844 4.36816L8.00781 4.62012L8.28125 4.64258L11.8516 4.94336L9.16113 7.21094L8.94434 7.39355L9.00977 7.66992L9.81641 11.0576L6.73242 9.25L6.5 9.11426L6.26758 9.25L3.18262 11.0576L3.99023 7.66992L4.05566 7.39355L3.83887 7.21094L1.14746 4.94336L4.71875 4.64258L4.99219 4.62012L5.10156 4.36816L6.5 1.15332L7.89844 4.36816Z"
                fill="#0171F9"
                stroke="#0171F9"
                strokeWidth="0.92"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(isFirstLoad){
          setLoading(true);
        }
        
        
        const response = await fetch(
          `/api/schools/${schoolId}?page=${currentPage}&limit=${REPORTS_PER_PAGE}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch school details");
        }

        const data = await response.json();
       
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch school details");
        }

        setSchoolData(data.school);

        // Transform reports to match SchoolReport type
        const transformedReports: SchoolReport[] = data.reports.map((report: any) => ({
          id: `RPT - ${report.id}`,
          grade: report.grade_level || "N/A",
          teacher: report.teacher_name || "N.A",
          date: report.date_of_assignment
            ? new Date(report.date_of_assignment).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "N/A",
          sentiment: report.sentiments,
          status: report.status == 1 ? "Pending" : report.status == 2 ? "Approved" : "Rejected",
          quote: report.feedback || "No Feedback",
          schoolReturn: report.return_to_school == 1 ? "Yes" : report.return_to_school == 2 ? "No" : "Maybe",
          teacherReturn: report.return_to_teacher == 1 ? "Yes" : report.return_to_teacher == 2 ? "No" : "Maybe"
        }));

        setReports(transformedReports);
        setTotalPages(data.pagination.totalPages);
        setTotalReports(data.pagination.total);
        setError(null);
      } catch (err) {
        console.error("Error fetching school data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
    };

    if (schoolId) {
      fetchData();
    }
  }, [schoolId, currentPage]);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#0171F9] rounded-full animate-spin" />
          <p className="font-inter text-[#6B7280]">Loading School...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F3F4F7]">
      {/* Page top bar */}
      <div className="flex flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <Link href="/admin/schools"  className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer">
            <BackArrowIcon />
          </div>
          <h1 className="font-outfit font-semibold text-xl sm:text-2xl lg:text-[28px] text-[#121212] leading-5">School</h1>
        </Link>
        <Link href={`/admin/schools/edit/${schoolData?.id}`} className="flex items-center gap-1.5 px-3 sm:px-[17px] py-2 sm:py-3 rounded-lg border border-[#EFF0F2] bg-white hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base">
          <EditIcon />
          <span className="font-inter font-semibold text-[#333]">Edit</span>
        </Link>
      </div>

      {/* School info card */}
      <div className="bg-white rounded-lg overflow-hidden mb-4">
        {/* Top section: school name + rating */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-0 lg:gap-6 px-4 sm:px-6 lg:px-7 py-4 sm:py-5 lg:py-3">
          {/* Left: name, badges, location */}
          <div className="flex flex-col gap-3 flex-1">
            {/* Name row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 flex-wrap pt-2">
              <h2 className="font-inter font-bold text-lg sm:text-xl lg:text-2xl text-[#030711] leading-5">
                {schoolData?.school_name}
              </h2>
              <div className="flex gap-2 flex-wrap">
                <span className="flex items-center px-3 sm:px-4 py-1 rounded-full border border-[rgba(11,119,249,0.40)] bg-[#EFF6FF]">
                  <span className="font-inter font-medium text-xs sm:text-sm text-[#0B77F9]">{schoolData?.school_association}</span>
                </span>
                {schoolData && schoolData?.total_reports > 0 && (
                  <span
                    className={`flex items-center px-3 sm:px-4 py-1 rounded-full font-inter font-medium text-xs sm:text-sm ${schoolData.calculated_risk === "Low"
                        ? "border border-[rgba(34,164,93,0.40)] bg-[#E6FBF0] text-[#22A45D]"
                        : schoolData.calculated_risk === "Medium"
                          ? "border border-[rgba(255,166,0,0.40)] bg-[#FFF4E0] text-[#FFA600]"
                          : "border border-[rgba(224,44,44,0.40)] bg-[#FEEFEF] text-[#E02C2C]"
                      }`}
                  >
                    {schoolData.calculated_risk} Risk
                  </span>
                )}
              </div>
            </div>

            {/* Location row */}
            {schoolData && (
              <div className="flex flex-row sm:items-center gap-3 sm:gap-5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <LocationPinIcon />
                  <span className="font-outfit font-normal text-xs sm:text-sm text-[#414141] leading-7">
                    {[schoolData.city, schoolData.state].filter(Boolean).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BuildingIcon />
                  <span className="font-outfit font-normal text-xs sm:text-sm text-[#414141] leading-7">
                    {schoolData.school_association == "School District" ? schoolData.school_district_name : schoolData.school_association}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: rating */}
          {schoolData && (
            <div className="flex items-start gap-2 flex-shrink-0 pt-2 w-full sm:w-auto sm:justify-end">
              <div className="flex flex-col items-start sm:items-end pt-2 gap-[5px]">
                <div className="flex items-center gap-2">
                  <div>
                    <span className="font-outfit font-bold text-2xl sm:text-4xl text-[#191C1D] leading-[40px]">
                      {schoolData.avg_rating || "0"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <StarRating count={schoolData.avg_rating} />

                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-1.5">
                  <span className="font-inter font-normal text-md text-[#9CA3AF] leading-[16.5px]">
                    {schoolData.total_reports} reviews
                  </span>
                  <span className="font-inter font-normal text-md text-[#9CA3AF] leading-[16.5px]">{schoolData.school_year}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-black opacity-10 mx-4 sm:mx-6 lg:mx-7" />

        {/* Stats row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 px-4 sm:px-6 lg:px-7 py-4 sm:py-5 lg:py-3">
          {/* This Month vs Last */}
          <div className="flex flex-col">
            <span className="font-outfit font-medium text-sm sm:text-md text-[#AFAFB2] leading-7">This Month vs Last</span>
            <div className="flex items-baseline gap-2 flex-wrap">
              {(Number(schoolData?.reports_this_month) > Number(schoolData?.reports_last_month)) ? <TrendUpIcon/> : <TrendDownIcon />}
              
              <span className="font-outfit font-semibold text-base sm:text-lg text-[#000]">{schoolData?.reports_this_month
}</span>
              <span className="font-outfit font-medium text-xs sm:text-[12px] text-[#AFAFB2]">vs {schoolData?.reports_last_month
} last Month</span>
            </div>
          </div>

          <div className="hidden lg:block w-px h-[46px] bg-black opacity-10" />

          {/* Would Return to School (current period) */}
          <div className="flex flex-col ">
            <span className="font-outfit font-medium text-sm sm:text-md text-[#AFAFB2] leading-7">Would Return to Teacher</span>
            <div className="flex flex-row sm:items-center gap-3 sm:gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#10B981]">{schoolData?.return_to_teacher_yes_percentage || 0}%</span>
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#10B981]">Yes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E8A411]">{schoolData?.return_to_teacher_maybe_percentage || 0}%</span>
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E8A411]">Maybe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E02C2C]">{schoolData?.return_to_teacher_no_percentage || 0}%</span>
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E02C2C]">No</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-px h-[46px] bg-black opacity-10" />

          {/* Would Return to School (all-time) */}
          <div className="flex flex-col ">
            <span className="font-outfit font-medium text-sm sm:text-md text-[#AFAFB2] leading-7">Would Return to School</span>
            <div className="flex flex-row sm:items-center gap-3 sm:gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#10B981]">{schoolData?.return_to_school_yes_percentage || 0}%</span>
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#10B981]">Yes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E8A411]">{schoolData?.return_to_school_maybe_percentage || 0}%</span>
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E8A411]">Maybe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E02C2C]">{schoolData?.return_to_school_no_percentage || 0}%</span>
                <span className="font-outfit font-semibold text-base sm:text-lg text-[#E02C2C]">No</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 lg:px-7 mt-2">
          {(["Reports", "Teachers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2.5 sm:py-3.5 font-inter font-medium text-sm sm:text-md leading-5 transition-colors cursor-pointer border-b-2 ${activeTab === tab
                  ? "text-[#0171F9] border-[#0171F9]"
                  : "text-[#121212] border-transparent hover:text-[#0171F9]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Section */}
      {activeTab === "Reports" && (
        <div className="bg-white rounded-lg overflow-hidden relative">
          {/* Section header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <span className="font-outfit font-medium text-lg sm:text-2xl text-[#121212]">Reports</span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="px-4 sm:px-6 py-8 text-center text-[#6F6C70]">
              Loading reports...
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="px-4 sm:px-6 py-8 text-center text-[#E02C2C]">
              {error}
            </div>
          )}

          {/* Report cards */}
          {!loading && !error && (
            <>
              <div>
                {reports.length === 0 ? (
                  <div className="px-4 sm:px-6 py-8 text-center text-[#6F6C70]">
                    No reports found for this school.
                  </div>
                ) : (
                  reports.map((report, index) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      isLast={index === reports.length - 1}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalReports > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 sm:px-8 py-4 sm:py-5 border-t border-[#EFEFEF]">
                  <span className="font-inter font-normal text-xs sm:text-sm text-[#191C1E] opacity-80">
                    Show {(currentPage - 1) * REPORTS_PER_PAGE + 1}-
                    {Math.min(currentPage * REPORTS_PER_PAGE, totalReports)} of{" "}
                    {totalReports}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <ChevronLeftIcon />
                    </button>
                    {Array.from(
                      {
                        length: Math.min(4, totalPages),
                      },
                      (_, i) => {
                        let startPage: number;
                        if (totalPages <= 4) {
                          startPage = 1;
                        } else if (currentPage <= 2) {
                          startPage = 1;
                        } else if (currentPage > totalPages - 2) {
                          startPage = totalPages - 3;
                        } else {
                          startPage = currentPage - 1;
                        }
                        return startPage + i;
                      }
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-xs sm:text-[15px] transition-colors cursor-pointer ${currentPage === page
                            ? "bg-[#0171F9] text-white font-semibold"
                            : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Teachers Tab */}
      {activeTab === "Teachers" && <TeachersTab schoolId={schoolId} />}
    </main>
  );
}
