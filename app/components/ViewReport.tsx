import { getSentiment } from "@/lib/function";
import { ApproveIcon, RejectIcon } from "@/lib/icons";
import { Report } from "@/lib/types";

interface ViewReportProps {
  selectedReport: Report;
  loadingAction: string | null;
  setSelectedReport: React.Dispatch<React.SetStateAction<Report | null>>;
  handleApproveReport: (
    id: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleRejectReport: (
    id: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
 
  ReportDetails: () => React.ReactNode;
}

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 7.27757L1.52852 11.749C1.36122 11.9163 1.14829 12 0.889734 12C0.631179 12 0.418251 11.9163 0.25095 11.749C0.0836498 11.5817 0 11.3688 0 11.1103C0 10.8517 0.0836498 10.6388 0.25095 10.4715L4.72243 6L0.25095 1.52852C0.0836498 1.36122 0 1.14829 0 0.889734C0 0.631179 0.0836498 0.418251 0.25095 0.25095C0.418251 0.0836498 0.631179 0 0.889734 0C1.14829 0 1.36122 0.0836498 1.52852 0.25095L6 4.72243L10.4715 0.25095C10.6388 0.0836498 10.8517 0 11.1103 0C11.3688 0 11.5817 0.0836498 11.749 0.25095C11.9163 0.418251 12 0.631179 12 0.889734C12 1.14829 11.9163 1.36122 11.749 1.52852L7.27757 6L11.749 10.4715C11.9163 10.6388 12 10.8517 12 11.1103C12 11.3688 11.9163 11.5817 11.749 11.749C11.5817 11.9163 11.3688 12 11.1103 12C10.8517 12 10.6388 11.9163 10.4715 11.749L6 7.27757Z" fill="#212121" />
  </svg>
);

const SchoolIcon = () => (

  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.59998 12.6001V5.8501L0.599976 6.69385V12.6001H3.59998ZM3.59998 12.6001H9.59998M3.59998 12.6001V2.60035M9.59998 12.6001V5.8501L12.6 6.69385V12.6001H9.59998ZM9.59998 12.6001V2.60035M11.1 3.6001L6.59998 0.600098L2.09998 3.6001M5.84998 4.3501H7.34998M5.84998 6.6001H7.34998" stroke="#5C5C5C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

const AnonymousIcon = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
    <path d="M11.0003 10.8957C12.3323 10.8957 13.4163 9.81218 13.4163 8.48018C13.4163 7.14818 12.3323 6.06418 11.0003 6.06418C10.0863 6.06418 9.29883 6.58018 8.88833 7.33068H6.11183C5.70183 6.58018 4.91433 6.06418 4.00033 6.06418C2.66833 6.06418 1.58433 7.14818 1.58433 8.48018C1.58433 9.81218 2.66833 10.8952 4.00033 10.8952C5.33233 10.8952 6.41583 9.81218 6.41583 8.48018C6.41583 8.42868 6.40383 8.38118 6.40083 8.33018H8.59933C8.59633 8.38118 8.58433 8.42868 8.58433 8.48018C8.58526 9.12057 8.84013 9.73445 9.29304 10.1872C9.74596 10.6399 10.3599 10.895 11.0003 10.8957ZM11.0003 7.06418C11.7808 7.06418 12.4163 7.69918 12.4163 8.48018C12.4163 9.26118 11.7813 9.89518 11.0003 9.89518C10.2193 9.89518 9.58433 9.26068 9.58433 8.48018C9.58433 7.69968 10.2193 7.06418 11.0003 7.06418ZM4.00033 9.89568C3.21933 9.89568 2.58433 9.26068 2.58433 8.48018C2.58433 7.69968 3.21933 7.06418 4.00033 7.06418C4.78133 7.06418 5.41583 7.69918 5.41583 8.48018C5.41583 9.26118 4.78083 9.89568 4.00033 9.89568ZM14.6373 4.83968C13.8537 4.61688 13.0599 4.43101 12.2588 4.28268L11.4903 0.403183C11.4603 0.258183 11.3703 0.133183 11.2453 0.0631832C11.1814 0.0288753 11.1109 0.00846769 11.0385 0.00329765C10.9662 -0.00187239 10.8935 0.00831188 10.8253 0.0331832C8.68266 0.843186 6.318 0.843186 4.17533 0.0331832C4.10829 0.00697517 4.03624 -0.00393172 3.96444 0.00125846C3.89264 0.00644863 3.82291 0.0276049 3.76033 0.0631832C3.63033 0.133183 3.54033 0.258183 3.51033 0.403183L2.74183 4.28318C1.94056 4.43134 1.14668 4.61704 0.36283 4.83968C0.299645 4.85771 0.240633 4.88801 0.189167 4.92886C0.1377 4.96971 0.0947898 5.0203 0.0628881 5.07774C0.0309863 5.13518 0.0107191 5.19835 0.00324522 5.26363C-0.0042287 5.32891 0.00123719 5.39502 0.0193304 5.45818C0.0953304 5.72318 0.37233 5.87468 0.63783 5.80168C5.12286 4.51853 9.8778 4.51853 14.3628 5.80168C14.4887 5.83293 14.6219 5.81406 14.7341 5.74906C14.8464 5.68406 14.9291 5.578 14.9647 5.45325C15.0003 5.3285 14.986 5.19479 14.925 5.08033C14.8639 4.96587 14.7608 4.87959 14.6373 4.83968ZM3.79383 4.10768L4.38033 1.16318C6.4111 1.80318 8.58956 1.80318 10.6203 1.16318L11.2053 4.10718C8.74757 3.75243 6.25159 3.75292 3.79383 4.10768Z" fill="#0171F9" />
  </svg>
);

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.6 7.26676C10.6 7.56145 10.4829 7.84406 10.2745 8.05244C10.0662 8.26081 9.78355 8.37788 9.48886 8.37788H2.8222L0.599976 10.6001V1.71121C0.599976 1.41652 0.717039 1.13391 0.925412 0.925535C1.13379 0.717161 1.4164 0.600098 1.71109 0.600098H9.48886C9.78355 0.600098 10.0662 0.717161 10.2745 0.925535C10.4829 1.13391 10.6 1.41652 10.6 1.71121V7.26676Z" stroke="#0171F9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5 14.5V7.75L2 8.59375V14.5H5ZM5 14.5H11M5 14.5V4.50025M11 14.5V7.75L14 8.59375V14.5H11ZM11 14.5V4.50025M12.5 5.5L8 2.5L3.5 5.5M7.25 6.25H8.75M7.25 8.5H8.75" stroke="#0171F9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M7.99996 8.66667C9.84091 8.66667 11.3333 7.17428 11.3333 5.33333C11.3333 3.49238 9.84091 2 7.99996 2C6.15901 2 4.66663 3.49238 4.66663 5.33333C4.66663 7.17428 6.15901 8.66667 7.99996 8.66667ZM7.99996 8.66667C9.41445 8.66667 10.771 9.22857 11.7712 10.2288C12.7714 11.229 13.3333 12.5855 13.3333 14M7.99996 8.66667C6.58547 8.66667 5.22892 9.22857 4.22872 10.2288C3.22853 11.229 2.66663 12.5855 2.66663 14" stroke="#0171F9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ReturnCard({
  icon, question, answer, comment,
}: {
  icon: React.ReactNode;
  question: string;
  answer: string;
  comment: string;
}) {
  const answerColor = answer === "Yes" ? "bg-[#BBFBE6] text-[#2D7D65]" : answer === "No" ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#FFF3DC] text-[#D97706]";
  const barColor = answer === "Yes" ? "bg-[#22C55E]" : answer === "No" ? "bg-red-400" : "bg-yellow-400";

  return (
    <div className="rounded-xl border border-[rgba(178,178,178,0.40)] bg-[#F8FAFF] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[rgba(178,178,178,0.40)] bg-[#EFF6FF] rounded-t-xl">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="font-outfit text-sm font-medium text-[#0171F9]">{question}</span>
        </div>
        {answer &&
          <span className={`px-4 py-0.5 rounded-full font-inter text-xs font-semibold ${answerColor}`}>{answer}</span>
        }
      </div>
      {comment &&
        <div className="flex items-center gap-2.5 px-5 py-4">
          <div className={`w-0.5 self-stretch rounded-full ${barColor}`} />
          <p className="font-inter text-sm italic font-normal text-[#464555] leading-[22px]">{comment}</p>
        </div>}
    </div>
  );
}

 const ViewReport = ({
  selectedReport,
  loadingAction,
  setSelectedReport,
  handleApproveReport,
  handleRejectReport,
  ReportDetails,
}: ViewReportProps) => {
    return <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-6 lg:px-7 pt-4 sm:pt-6 lg:pt-8 pb-3 sm:pb-6 border-b border-black/10 flex-shrink-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-end gap-3 flex-wrap">
                      <h2 className="font-outfit font-semibold text-[32px] text-[#121212] leading-5">{`RPT-${selectedReport.id}`}</h2>
                      <div className="flex items-center gap-1.5">
                        {selectedReport.post_as == 1 ? <AnonymousIcon /> : <UserIcon />}
                        <span className="font-inter font-medium text-xs text-[#121212] opacity-70">{selectedReport.post_as == 1 ? "Anonymous" : selectedReport.your_name ? selectedReport.your_name : "NA"}</span>
                      </div>
                      <div className="flex items-center gap-2 pb-0.5">
    
                        <span className={`px-2.5 py-1 rounded-md font-inter font-semibold text-xs ${getSentiment(selectedReport).label == "Positive"
                          ? "bg-[#BBFBE6] text-[#2D7D65]"
                          : getSentiment(selectedReport).label == "Negative"
                            ? "bg-[#FEE2E2] text-[#991B1B]"
                            : "bg-[#FFF3DC] text-[#D97706]"}`}>
                          {getSentiment(selectedReport).label}
                        </span>
                        <span className="px-2.5 py-1 rounded-md font-inter font-semibold text-xs text-[#F8A202] bg-[#FFEECE] ">
                          {selectedReport.status == 1 ? "Pending" : selectedReport.status == 2 ? "Approved" : "Rejected"}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedReport(null)} className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                      <XIcon />
                    </button>
                  </div>
    
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      <SchoolIcon />
                      <span className="font-inter font-medium text-[13px] text-[#030711] opacity-80">{selectedReport.school_name}</span>
                      <span className="w-1 h-1 rounded-full bg-[#676767]" />
                      <span className="font-inter font-medium text-xs text-[#121212] opacity-64">{selectedReport.grade_level}</span>
    
                      {selectedReport.teacher_name !== "--" && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#676767]" />
                          <span className="font-inter font-medium text-xs text-[#121212] opacity-64">{selectedReport.teacher_name}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
    
                      <svg width="17" height="17" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7.39539 7.41538C7.5097 7.45906 7.60199 7.54635 7.65195 7.65806C7.70192 7.76976 7.70548 7.89674 7.66185 8.01107C7.26862 9.03999 6.67047 9.60738 5.94431 9.89168C5.27231 10.1538 4.5277 10.1538 3.88585 10.1538H3.84585C3.15662 10.1538 2.57816 10.16 2.08339 10.3532C1.62862 10.5305 1.20462 10.8861 0.892625 11.7034C0.848884 11.8177 0.761519 11.91 0.649747 11.9599C0.537976 12.0098 0.410954 12.0133 0.296625 11.9695C0.182297 11.9258 0.0900263 11.8384 0.0401128 11.7267C-0.00980069 11.6149 -0.0132688 11.4879 0.0304715 11.3735C0.423087 10.3446 1.02124 9.77722 1.74739 9.49292C2.42001 9.23076 3.16462 9.23076 3.80585 9.23076H3.84585C4.53508 9.23076 5.11354 9.22461 5.60831 9.03138C6.0637 8.85415 6.4877 8.49845 6.7997 7.68122C6.84338 7.56691 6.93067 7.47463 7.04237 7.42466C7.15408 7.37469 7.28106 7.37175 7.39539 7.41538ZM7.19847 0H9.72585C10.4231 0 10.9929 3.35276e-08 11.4428 0.0603077C11.9129 0.123692 12.3203 0.260307 12.6458 0.585846C12.9708 0.911384 13.1074 1.31815 13.1708 1.78892C13.2311 2.23815 13.2311 2.808 13.2311 3.50584V4.80246C13.2311 5.49969 13.2311 6.06892 13.1708 6.51938C13.108 6.98892 12.9708 7.3963 12.6458 7.72184C12.3209 8.04738 11.9129 8.18399 11.4428 8.24738C10.9929 8.30769 10.4231 8.30769 9.72585 8.30769H8.76893C8.64652 8.30769 8.52912 8.25906 8.44257 8.1725C8.35601 8.08595 8.30739 7.96856 8.30739 7.84615C8.30739 7.72374 8.35601 7.60635 8.44257 7.51979C8.52912 7.43324 8.64652 7.38461 8.76893 7.38461H9.69262C10.4311 7.38461 10.9388 7.38338 11.3197 7.3323C11.6871 7.28307 11.8674 7.19446 11.9929 7.06892C12.1185 6.94399 12.2065 6.76369 12.2563 6.39569C12.3074 6.01476 12.3086 5.50769 12.3086 4.76923V3.53846C12.3086 2.8 12.3074 2.29292 12.2563 1.912C12.2071 1.544 12.1185 1.36431 11.9929 1.23877C11.8674 1.11323 11.6871 1.02461 11.3197 0.975384C10.9382 0.924307 10.4311 0.923076 9.69323 0.923076H7.2317C6.49324 0.923076 5.98554 0.924307 5.60462 0.975384C5.23724 1.02461 5.05693 1.11323 4.93139 1.23877C4.82431 1.34585 4.74554 1.49169 4.69385 1.75569C4.6397 2.03261 4.62185 2.4 4.61754 2.92677C4.61706 2.98738 4.60464 3.0473 4.581 3.10311C4.55736 3.15892 4.52295 3.20953 4.47975 3.25204C4.43655 3.29456 4.3854 3.32815 4.32922 3.35089C4.27304 3.37364 4.21292 3.3851 4.15231 3.38461C4.0917 3.38413 4.03178 3.37171 3.97597 3.34807C3.92016 3.32442 3.86955 3.29002 3.82704 3.24682C3.78452 3.20362 3.75093 3.15247 3.72819 3.09629C3.70544 3.0401 3.69398 2.97999 3.69447 2.91938C3.69878 2.39569 3.71539 1.94892 3.78801 1.57784C3.86308 1.19446 4.00401 0.860307 4.27847 0.585846C4.60462 0.260307 5.01139 0.123692 5.48154 0.0603077C5.93139 3.35276e-08 6.50124 0 7.19847 0Z" fill="#121212"></path><path fillRule="evenodd" clipRule="evenodd" d="M3.84564 5.23126C3.56002 5.23126 3.2861 5.34473 3.08414 5.54669C2.88218 5.74865 2.76872 6.02257 2.76872 6.30819C2.76872 6.5938 2.88218 6.86772 3.08414 7.06969C3.2861 7.27165 3.56002 7.38511 3.84564 7.38511C4.13126 7.38511 4.40518 7.27165 4.60714 7.06969C4.8091 6.86772 4.92256 6.5938 4.92256 6.30819C4.92256 6.02257 4.8091 5.74865 4.60714 5.54669C4.40518 5.34473 4.13126 5.23126 3.84564 5.23126ZM1.84564 6.30819C1.84564 5.77775 2.05636 5.26905 2.43143 4.89397C2.8065 4.5189 3.31521 4.30819 3.84564 4.30819C4.37607 4.30819 4.88478 4.5189 5.25985 4.89397C5.63492 5.26905 5.84564 5.77775 5.84564 6.30819C5.84564 6.83862 5.63492 7.34733 5.25985 7.7224C4.88478 8.09747 4.37607 8.30818 3.84564 8.30818C3.31521 8.30818 2.8065 8.09747 2.43143 7.7224C2.05636 7.34733 1.84564 6.83862 1.84564 6.30819ZM6.15333 2.92357C6.15333 2.80117 6.20196 2.68377 6.28851 2.59722C6.37507 2.51066 6.49246 2.46204 6.61487 2.46204H10.3072C10.4296 2.46204 10.547 2.51066 10.6335 2.59722C10.7201 2.68377 10.7687 2.80117 10.7687 2.92357C10.7687 3.04598 10.7201 3.16338 10.6335 3.24993C10.547 3.33649 10.4296 3.38511 10.3072 3.38511H6.61487C6.49246 3.38511 6.37507 3.33649 6.28851 3.24993C6.20196 3.16338 6.15333 3.04598 6.15333 2.92357ZM7.99948 5.38511C7.99948 5.2627 8.04811 5.14531 8.13466 5.05875C8.22122 4.9722 8.33861 4.92357 8.46102 4.92357H10.3072C10.4296 4.92357 10.547 4.9722 10.6335 5.05875C10.7201 5.14531 10.7687 5.2627 10.7687 5.38511C10.7687 5.50752 10.7201 5.62491 10.6335 5.71147C10.547 5.79802 10.4296 5.84665 10.3072 5.84665H8.46102C8.33861 5.84665 8.22122 5.79802 8.13466 5.71147C8.04811 5.62491 7.99948 5.50752 7.99948 5.38511Z" fill="#121212"></path></svg>
    
                      <span className="font-inter font-medium text-[13px] text-[#030711] opacity-80">{selectedReport?.school_association}</span>
                    </div>
                  </div>
                </div>
    
                {/* Score + Ratings */}
                {ReportDetails()}
    
                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-7 pb-6 flex flex-col gap-7">
                  {/* Written Review */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <ChatIcon />
                      <h3 className="font-outfit font-medium text-sm text-[#121212] leading-6">Written Review</h3>
                    </div>
                    <div className="rounded-lg border border-[#E8EDF5] bg-[#F8F9FD] px-5 py-6">
                      <p className="font-inter text-sm italic font-normal text-[#1E1E1E] opacity-[0.72] leading-[26px]">
                        {selectedReport.feedback}
                      </p>
                    </div>
                  </div>
    
                  {/* Tags */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-outfit font-medium text-md text-[#121212] leading-6">Tags</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedReport.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-xl border border-[#C0DCFD] bg-[#EFF6FF] font-inter font-semibold text-xs text-[#0171F9] leading-[15px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
    
                  {/* Return cards */}
                  <div className="flex flex-col gap-6">
                    {(selectedReport?.return_to_school || selectedReport?.school_comment) ?
                      <ReturnCard
                        icon={<BuildingIcon />}
                        question="Would you return to this school?"
                        answer={selectedReport?.return_to_school == 1 ? "Yes" : selectedReport?.return_to_school == 2 ? "No" : "Maybe"}
                        comment={selectedReport?.school_comment}
                      /> : ""}
                    {(selectedReport?.return_to_teacher || selectedReport?.teacher_comment) ?
                      <ReturnCard
                        icon={<UserIcon />}
                        question="Would you return for this teacher or class?"
                        answer={selectedReport?.return_to_teacher == 1 ? "Yes" : selectedReport?.return_to_teacher == 2 ? "No" : "Maybe"}
                        comment={selectedReport?.teacher_comment}
                      /> : ""}
                  </div>
                </div>
    
                {/* Footer actions */}
                {selectedReport.status == 1 &&
                  <div className="px-5 py-[17px] border-t border-[#F0F0F0] bg-white flex items-center gap-3">
                    <button
                      onClick={(e) => { handleApproveReport(Number(selectedReport.id), e);
                        
                       }}
                      disabled={loadingAction === `approve-${selectedReport.id}`}
                      className="cursor-pointer flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg border border-[#BDF7D3] bg-[#DDFCE9] hover:opacity-90 disabled:opacity-60 transition-opacity"
                    >
                      {loadingAction === `approve-${selectedReport.id}` ? (
                        <div className="w-4 h-4 border-2 border-[#32A85B] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ApproveIcon />
                      )}
                      <span className="font-inter font-medium text-sm text-[#32A85B] leading-5">
                        {loadingAction === `approve-${selectedReport.id}` ? "Approving..." : "Approve"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => { {handleRejectReport(Number(selectedReport.id), e)
                        
                      } }}
                      disabled={loadingAction === `reject-${selectedReport.id}`}
                      className="cursor-pointer flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg border border-[#FDCACA] bg-[#FDE2E2] hover:opacity-90 disabled:opacity-60 transition-opacity"
                    >
                      {loadingAction == `reject-${selectedReport.id}`  ? (
                        <div className="w-4 h-4 border-2 border-[#DD393D] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RejectIcon />
                      )}
                      <span className="font-inter font-medium text-sm text-[#DD393D] leading-5">
                        {loadingAction == `reject-${selectedReport.id}` ? "Rejecting..." : "Reject"}
                      </span>
                    </button>
                  </div>}
              </div>
}

export default ViewReport