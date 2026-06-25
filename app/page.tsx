import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LocationIcon } from "@/lib/icons";
import { getSentiment } from "@/lib/function";

async function getHomePageData() {
  try {
    const [
      recentReportsResult,
      reportsCountResult,
      schoolsCountResult,
    ] = await Promise.all([
      supabase
        .from("reports")
        .select(`
          school_name,
          feedback,
          AI_sentiment,
          created_at,
          grade_level,
          schools (
            city,
            state
          )
        `)
        .eq("status", 2)
        .order("created_at", {
          ascending: false,
        })
        .limit(3),

      supabase
        .from("reports")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", 2),

      supabase
        .from("schools")
        .select("*", {
          count: "exact",
          head: true,
        }),
    ]);

    return {
      recentReports:
        recentReportsResult.data || [],

      totalReports:
        reportsCountResult.count || 0,

      totalSchools:
        schoolsCountResult.count || 0,
    };
  } catch (error) {
    console.error(
      "Failed to fetch homepage data:",
      error
    );

    return {
      recentReports: [],
      totalReports: 0,
      totalSchools: 0,
    };
  }
}

export default async function Home() {
  const {
    recentReports,
    totalReports,
    totalSchools,
  } = await getHomePageData();


  const formatCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000)
      .toFixed(1)
      .replace(".0", "")}M+`;
  }

  if (count >= 1000) {
    return `${(count / 1000)
      .toFixed(1)
      .replace(".0", "")}K+`;
  }

  return String(count).padStart(2, "0");
}

  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-blue-50 sm:px-9 px-6 pt-[35px]">
          <div className="relative overflow-hidden rounded-3xl bg-blue-50 min-h-[680px] flex flex-col items-center">
            {/* Decorative blue blur blobs */}
            <div className="absolute w-[682px] h-[323px] rounded-full bg-blue-600 opacity-10 blur-[90px] pointer-events-none z-0 -left-[400px] top-[270px]" />
            <div className="absolute w-[682px] h-[323px] rounded-full bg-blue-600 opacity-10 blur-[90px] pointer-events-none z-0 -right-[400px] top-[540px]" />

            {/* Text content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-6 pt-5 max-w-[1111px] text-center">
              <div className="inline-flex px-[15px] py-1.5 rounded-lg bg-slate-900 text-blue-50 font-inter text-xs font-semibold leading-4">
                Real Teacher Insights
              </div>
              <h1 className="text-gray-950 font-inter text-[clamp(25px,5vw,62px)] font-bold leading-[1.13]">
                DISCOVER THE REALITY OF WHAT TO EXPECT FROM A SCHOOL SITE BEFORE SAYING YES TO AN UNFAMILIAR GUEST-TEACHING OPPORTUNITY
              </h1>
              <div className="flex items-center gap-[15px] flex-wrap justify-center">
                <Link href="/submit-report" className="flex items-center justify-center gap-2  px-8 py-4 rounded-xl bg-blue-600 text-white font-inter text-base font-bold leading-6 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/6">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.16667 15.7416H5.345L13.1067 7.97994L11.9283 6.80161L4.16667 14.5633V15.7416ZM17.5 17.4083H2.5V13.8724L13.6958 2.67661C13.8521 2.52038 14.064 2.43262 14.285 2.43262C14.506 2.43262 14.7179 2.52038 14.8742 2.67661L17.2317 5.03411C17.3879 5.19038 17.4757 5.4023 17.4757 5.62327C17.4757 5.84424 17.3879 6.05617 17.2317 6.21244L7.7025 15.7416H17.5V17.4083ZM13.1067 5.62327L14.285 6.80161L15.4633 5.62327L14.285 4.44494L13.1067 5.62327Z" fill="white" />
                  </svg>
                  Submit a Report
                </Link>
                <Link href="/browse-school" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-black/20 bg-white text-gray-800 font-inter text-base font-bold leading-6 hover:border-black/40 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.91667 13.3333C6.40278 13.3333 5.12167 12.8089 4.07333 11.76C3.025 10.7111 2.50056 9.43 2.5 7.91667C2.49944 6.40333 3.02389 5.12222 4.07333 4.07333C5.12278 3.02444 6.40389 2.5 7.91667 2.5C9.42945 2.5 10.7108 3.02444 11.7608 4.07333C12.8108 5.12222 13.335 6.40333 13.3333 7.91667C13.3333 8.52778 13.2361 9.10417 13.0417 9.64583C12.8472 10.1875 12.5833 10.6667 12.25 11.0833L16.9167 15.75C17.0694 15.9028 17.1458 16.0972 17.1458 16.3333C17.1458 16.5694 17.0694 16.7639 16.9167 16.9167C16.7639 17.0694 16.5694 17.1458 16.3333 17.1458C16.0972 17.1458 15.9028 17.0694 15.75 16.9167L11.0833 12.25C10.6667 12.5833 10.1875 12.8472 9.64583 13.0417C9.10417 13.2361 8.52778 13.3333 7.91667 13.3333ZM7.91667 11.6667C8.95833 11.6667 9.84389 11.3022 10.5733 10.5733C11.3028 9.84445 11.6672 8.95889 11.6667 7.91667C11.6661 6.87444 11.3017 5.98917 10.5733 5.26083C9.845 4.5325 8.95945 4.16778 7.91667 4.16667C6.87389 4.16556 5.98861 4.53028 5.26083 5.26083C4.53306 5.99139 4.16833 6.87667 4.16667 7.91667C4.165 8.95667 4.52972 9.84222 5.26083 10.5733C5.99195 11.3044 6.87722 11.6689 7.91667 11.6667Z" fill="#2C3031" />
                  </svg>
                  Search School
                </Link>
              </div>
            </div>

            <img src="/homebanner.png" className="mt-[40px] md:hidden z-2" alt="Image" />


            {/* Phone mockup */}
            <div className="hero-mockup-area sm:flex hidden">
              <div className="hero-ring hero-ring--outer" />
              <div className="hero-ring hero-ring--mid" />
              <div className="hero-ring hero-ring--inner" />
              <div className="hero-circle-fill" />

              {/* Phone mockup */}
              <Image src="/Artboard.svg" height={500} width={500} className="w-[400px] h-[410px] z-2" alt="Image" />

              {/* Anonymous Report floating card */}
              <div className="anon-report-card">
                <span className="anon-report-card__label">Anonymous Report</span>
                <div className="anon-report-card__badge">
                  <span className="anon-report-card__badge-text">Enabled</span>
                  <div className="anon-report-card__toggle" />
                </div>
              </div>

              {/* Floating review card */}
              <div className="review-card">
                <div className="review-card__header">
                  <div className="review-card__school-info">
                    <span className="review-card__school-name">Oakridge Academy</span>
                    <span className="review-card__school-type">Public High School</span>
                  </div>
                  <div className="review-card__rating-badge">4.8 Rating</div>
                </div>
                <div className="review-card__body">
                  <div className="review-card__skeleton-wrapper">
                    <div className="review-card__skeleton-line review-card__skeleton-line--full" />
                    <div className="review-card__skeleton-line review-card__skeleton-line--short" />
                  </div>
                  <div className="review-card__footer">
                    <div className="review-card__verified">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.73464 15L4.46797 12.8667L2.06797 12.3333L2.3013 9.86667L0.667969 8L2.3013 6.13333L2.06797 3.66667L4.46797 3.13333L5.73464 1L8.0013 1.96667L10.268 1L11.5346 3.13333L13.9346 3.66667L13.7013 6.13333L15.3346 8L13.7013 9.86667L13.9346 12.3333L11.5346 12.8667L10.268 15L8.0013 14.0333L5.73464 15ZM6.3013 13.3L8.0013 12.5667L9.73464 13.3L10.668 11.7L12.5013 11.2667L12.3346 9.4L13.568 8L12.3346 6.56667L12.5013 4.7L10.668 4.3L9.7013 2.7L8.0013 3.43333L6.26797 2.7L5.33464 4.3L3.5013 4.7L3.66797 6.56667L2.43464 8L3.66797 9.4L3.5013 11.3L5.33464 11.7L6.3013 13.3ZM7.3013 10.3667L11.068 6.6L10.1346 5.63333L7.3013 8.46667L5.86797 7.06667L4.93464 8L7.3013 10.3667Z" fill="#0171F9" />
                      </svg>
                      <span>Verified User</span>
                    </div>
                    <span className="review-card__timestamp">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Why Guest-Teacher Report Section */}
        <section className="bg-white px-6 sm:pb-[72px] pb-0 pt-[72px] flex flex-col items-center gap-12">
          <h2 className="text-gray-950 text-center font-[Outfit] text-[clamp(28px,4vw,44px)] font-semibold leading-[1.2]">
            Why Guest-Teacher Report
          </h2>

          {/* Row 1 – three columns */}
          <div className="flex sm:flex-row flex-col sm:items-start items-center justify-center w-full max-w-[1200px] gap-[40px] sm:gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 flex-1 px-4 min-w-0">
              <Image src="/anonymous.svg" height={100} width={100} className="w-[70px] h-[70px]" alt="Icon" />
              <h3 className="text-gray-800 text-center font-[Outfit] text-2xl font-semibold leading-8">Stay Anonymous</h3>
              <p className="text-gray-800 text-center font-inter text-base font-normal leading-[26px] px-12">Share classroom experiences without revealing your identity.</p>
            </div>

            <div className="w-[250px] h-px md:w-px md:h-auto md:min-h-[173px] bg-gray-300 opacity-70 flex-shrink-0" />
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 flex-1 px-4 min-w-0">
              <div className="relative w-20 h-[70px] flex items-center justify-center">
                <Image src="/reports.svg" height={100} width={100} className="w-[60px] h-[60px]" alt="Icon" />
              </div>
              <h3 className="text-gray-800 text-center font-[Outfit] text-2xl font-semibold leading-8">Structured Reports</h3>
              <p className="text-gray-800 text-center font-inter text-base font-normal leading-[26px] px-12">Access clear, experience-based insights from other educators.</p>
            </div>

            <div className="w-[250px] h-px md:w-px md:h-auto md:min-h-[173px] bg-gray-300 opacity-70 flex-shrink-0" />

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 flex-1 px-4 min-w-0">
              <div className="relative w-20 h-[70px]">
                <Image src="/betterDecisions.svg" height={100} width={100} className="w-[70px] h-[70px]" alt="Icon" />
              </div>
              <h3 className="text-gray-800 text-center font-[Outfit] text-2xl font-semibold leading-8">Make Better Decisions</h3>
              <p className="text-gray-800 text-center font-inter text-base font-normal leading-[26px] px-12">Use real data to choose the right teaching assignments.</p>
            </div>
          </div>
          <div className="sm:hidden w-[250px] h-px md:w-px md:h-auto md:min-h-[173px] bg-gray-300 opacity-70 flex-shrink-0" />
          {/* Row 2 – two columns centered */}
          <div className="flex sm:flex-row flex-col sm:items-start items-center justify-center w-full max-w-[1200px] gap-[40px] sm:gap-0">
            {/* Smart Search & Filters */}
            <div className="flex flex-col items-center gap-2 flex-1 px-4 min-w-0">
              <Image src="/Frame.svg" height={100} width={100} className="w-[70px] h-[70px]" alt="Icon" />

              <h3 className="text-gray-800 text-center font-[Outfit] text-2xl font-semibold leading-8">Smart Search &amp; Filters</h3>
              <p className="text-gray-800 text-center font-inter text-base font-normal leading-[26px] px-12">Quickly find regular teacher or schools using powerful filters.</p>
            </div>

            <div className="w-[250px] h-px md:w-px md:h-auto md:min-h-[173px] bg-gray-300 opacity-70 flex-shrink-0" />

            {/* AI-Powered Insights */}
            <div className="flex flex-col items-center gap-2 flex-1 px-4 min-w-0">
              <div className="relative w-20 h-[70px] flex items-center justify-center">
                <Image src="/ai.svg" height={100} width={100} className="w-[70px] h-[70px]" alt="Icon" />

              </div>
              <h3 className="text-gray-800 text-center font-[Outfit] text-2xl font-semibold leading-8">AI-Powered Insights</h3>
              <p className="text-gray-800 text-center font-inter text-base font-normal leading-[26px] px-12">Understand sentiment and patterns with intelligent analysis.</p>
            </div>
          </div>
        </section>

        {/* Understand Every Classroom Section */}
        <section className="bg-white px-6 sm:pb-[72px] pb-0 pt-[72px]">
          <div className="max-w-[1176px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* <img src="/homeimagetest1.svg" alt="Image" className="sm:hidden w-full h-full"/> */}

            {/* Left: Profile visual panel */}
            <div className="sm:order-1 order-2 relative flex w-full lg:max-w-[534px] lg:flex-shrink-0 rounded-[32px] bg-[#F8F9FD] overflow-hidden lg:aspect-[534/396] aspect-auto min-h-[400px] lg:min-h-auto">
              {/* White profile card */}
              <div className="absolute left-[5.6%] top-[7.6%] w-[72.3%] h-[84.8%] bg-white rounded-2xl shadow-[0_4px_36px_0_rgba(1,113,249,0.06)]">
                <p className="absolute left-5 top-5 font-inter text-base font-medium text-black leading-[26px]">Profile</p>

                {/* Skeleton lines area */}
                <div className="absolute left-5 right-5 top-[17.9%] h-[47%] bg-[#F8F9FD] rounded-2xl">
                  <div className="absolute left-3.5 top-3.5 h-[13px] w-[80%] rounded-[10px] bg-[#E6E6E6]" />
                  <div className="absolute left-3.5 top-[39px] h-[13px] w-[78%] rounded-[10px] bg-[#E6E6E6]" />
                  <div className="absolute left-3.5 top-16 h-[13px] w-[64%] rounded-[10px] bg-[#E6E6E6]" />
                  <div className="absolute left-3.5 top-[89px] h-[13px] w-[64%] rounded-[10px] bg-[#E6E6E6]" />
                  <div className="absolute left-3.5 top-[114px] h-[13px] w-[67%] rounded-[10px] bg-[#E6E6E6]" />
                </div>

                {/* Dark navy quote box */}
                <div className="absolute left-5 right-5 bottom-5 bg-[#384F87] rounded-2xl px-5 sm:py-4 py-2">
                  <p className="font-inter sm:text-sm text-[12px] font-medium text-white leading-[22px]">
                    Get the pulse of the building from those who work there every day.
                  </p>
                </div>
              </div>

              {/* Feature badge: Risk Level */}
              <div className="absolute lg:top-[19.7%] lg:left-[57%] top-[19%] right-[8%] flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 bg-white rounded-full border border-[#F9F9F9] shadow-[0_10px_50px_-12px_rgba(0,0,0,0.16)] backdrop-blur-[5px]">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill="url(#paint0_linear_117_3956)" />
                    <defs>
                      <linearGradient id="paint0_linear_117_3956" x1="2.17462" y1="-21.1457" x2="57.8353" y2="6.78517" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-[10px] top-[10px]">
                    <path d="M9.44602 0.666626L4.66602 5.45329V14H12.8727L15.3327 8.26663V5.33329H9.79268L10.5393 1.74663L9.44602 0.666626ZM0.666016 5.99996H3.33268V14H0.666016V5.99996Z" fill="white" />
                  </svg>
                </div>
                <span className="font-inter sm:text-sm text-xs font-medium text-[#191C1D] whitespace-nowrap">Risk Level</span>
              </div>

              {/* Feature badge: Pattern-based insights */}
              <div className="absolute lg:top-[39.1%] lg:left-[50.6%] top-[35%] right-[8px] flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 bg-white rounded-full border border-[#F9F9F9] shadow-[0_10px_50px_-12px_rgba(0,0,0,0.16)] backdrop-blur-[5px]">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill="url(#paint0_linear_117_3962)" />
                    <defs>
                      <linearGradient id="paint0_linear_117_3962" x1="2.17462" y1="-21.1457" x2="57.8353" y2="6.78517" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-2 top-2">
                    <path d="M11.7158 8.28328L10.8325 7.87495C10.7597 7.84181 10.698 7.78844 10.6548 7.72121C10.6115 7.65398 10.5885 7.57572 10.5885 7.49578C10.5885 7.41585 10.6115 7.33759 10.6548 7.27036C10.698 7.20313 10.7597 7.14976 10.8325 7.11662L11.7158 6.70828L12.1241 5.83328C12.1573 5.76054 12.2106 5.69886 12.2779 5.65562C12.3451 5.61237 12.4233 5.58937 12.5033 5.58937C12.5832 5.58937 12.6615 5.61237 12.7287 5.65562C12.7959 5.69886 12.8493 5.76054 12.8825 5.83328L13.2908 6.71662L14.1658 7.12495C14.2385 7.1581 14.3002 7.21147 14.3435 7.2787C14.3867 7.34593 14.4097 7.42418 14.4097 7.50412C14.4097 7.58406 14.3867 7.66231 14.3435 7.72954C14.3002 7.79677 14.2385 7.85014 14.1658 7.88329L13.2825 8.29162L12.8741 9.16662C12.841 9.23936 12.7876 9.30104 12.7204 9.34429C12.6531 9.38754 12.5749 9.41053 12.495 9.41053C12.415 9.41053 12.3368 9.38754 12.2695 9.34429C12.2023 9.30104 12.1489 9.23936 12.1158 9.16662L11.7158 8.28328ZM3.70745 10.8333L4.11579 9.94995L4.99912 9.54162C5.07187 9.50847 5.13354 9.4551 5.17679 9.38787C5.22004 9.32064 5.24303 9.24239 5.24303 9.16245C5.24303 9.08251 5.22004 9.00426 5.17679 8.93703C5.13354 8.8698 5.07187 8.81643 4.99912 8.78329L4.11579 8.37495L3.70745 7.49995C3.67533 7.42728 3.62279 7.36551 3.55622 7.32215C3.48964 7.27879 3.41191 7.25571 3.33245 7.25571C3.253 7.25571 3.17527 7.27879 3.10869 7.32215C3.04212 7.36551 2.98958 7.42728 2.95745 7.49995L2.54912 8.38329L1.66579 8.79162C1.59304 8.82476 1.53137 8.87813 1.48812 8.94536C1.44487 9.01259 1.42187 9.09085 1.42188 9.17078C1.42187 9.25072 1.44487 9.32898 1.48812 9.39621C1.53137 9.46344 1.59304 9.51681 1.66579 9.54995L2.54912 9.95828L2.95745 10.8333C3.09912 11.1583 3.56579 11.1583 3.70745 10.8333ZM7.46579 6.65828L7.99079 5.49162L9.15745 4.96662C9.2302 4.93347 9.29188 4.8801 9.33512 4.81287C9.37837 4.74564 9.40137 4.66739 9.40137 4.58745C9.40137 4.50751 9.37837 4.42926 9.33512 4.36203C9.29188 4.2948 9.2302 4.24143 9.15745 4.20829L7.99079 3.68328L7.46579 2.51662C7.43264 2.44387 7.37927 2.3822 7.31204 2.33895C7.24481 2.2957 7.16656 2.27271 7.08662 2.27271C7.00668 2.27271 6.92843 2.2957 6.8612 2.33895C6.79397 2.3822 6.7406 2.44387 6.70746 2.51662L6.18246 3.68328L5.01579 4.20829C4.94304 4.24143 4.88137 4.2948 4.83812 4.36203C4.79487 4.42926 4.77187 4.50751 4.77187 4.58745C4.77187 4.66739 4.79487 4.74564 4.83812 4.81287C4.88137 4.8801 4.94304 4.93347 5.01579 4.96662L6.18246 5.49162L6.70746 6.65828C6.84912 6.98328 7.31579 6.98328 7.46579 6.65828ZM18.6158 6.89162C18.5357 6.81178 18.4402 6.74907 18.3351 6.70732C18.23 6.66557 18.1175 6.64565 18.0045 6.64877C17.8914 6.65188 17.7802 6.67798 17.6776 6.72546C17.5749 6.77294 17.483 6.84082 17.4075 6.92495L12.0825 12.9083L9.34079 10.1666C9.26369 10.0894 9.17212 10.0281 9.07131 9.98626C8.9705 9.94444 8.86243 9.92291 8.75329 9.92291C8.64415 9.92291 8.53608 9.94444 8.43527 9.98626C8.33446 10.0281 8.24288 10.0894 8.16579 10.1666L3.13245 15.2083C2.79079 15.55 2.79079 16.1166 3.13245 16.4583C3.47412 16.8 4.04079 16.8 4.38246 16.4583L8.75745 12.075L11.4658 14.7833C11.8075 15.125 12.3575 15.1083 12.6741 14.75L18.6491 8.02495C18.9408 7.69995 18.9241 7.19995 18.6158 6.89162Z" fill="white" />
                  </svg>
                </div>
                <span className="font-inter sm:text-sm text-xs font-medium text-[#191C1D] whitespace-nowrap">Pattern-based insights</span>
              </div>

              {/* Feature badge: Complete History */}
              <div className="absolute lg:top-[57.6%] lg:left-[55.8%] top-[51%] right-[2%] flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 bg-white rounded-full border border-[#F9F9F9] shadow-[0_10px_50px_-12px_rgba(0,0,0,0.16)] backdrop-blur-[5px]">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill="url(#paint0_linear_117_3968)" />
                    <defs>
                      <linearGradient id="paint0_linear_117_3968" x1="2.17462" y1="-21.1457" x2="57.8353" y2="6.78517" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="absolute left-2 top-2">
                    <path d="M3.555 13.3833C4.25989 14.8089 5.40339 15.9708 6.8175 16.6983C8.22126 17.4195 9.82199 17.6629 11.3767 17.3917C12.9361 17.1172 14.3648 16.3454 15.4492 15.1917C16.5433 14.0267 17.24 12.5449 17.4392 10.9592C17.6411 9.36978 17.3366 7.75721 16.5692 6.35083C15.8087 4.95515 14.6201 3.84068 13.1783 3.17166C11.7464 2.50847 10.1372 2.33058 8.595 2.665C7.05333 2.99916 5.79 3.75916 4.745 4.96083C4.61917 5.09416 4.1325 5.6325 3.72833 6.445M6.25 6.66666L3.2425 7.26666L2.5 4.16666M10 7.5V10.8333L12.5 12.5" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-inter sm:text-sm text-xs font-medium text-[#191C1D] whitespace-nowrap">Complete History</span>
              </div>
            </div>

            {/* Right: Text content */}
            <div className="sm:order-2 order-1 flex flex-col gap-7 flex-1 lg:max-w-[522px] w-full">
              <h2 className="font-[Outfit] sm:text-[clamp(28px,3.8vw,44px)] font-semibold text-[#121212] leading-[1.32] text-[clamp(20px,3.8vw,44px)]">
                Understand Every Classroom Before You Step In
              </h2>
              <p className="font-inter sm:text-base text-[#212121] leading-[26px] opacity-[0.96] text-[15px]">
                Explore detailed regular teacher profiles with aggregated reports, sentiment insights, and behavior patterns all in one structured view designed for clarity and confidence.
              </p>
            </div>

          </div>
        </section>

        {/* Find the Right Opportunities / AI-Powered Insights Section */}
        <section className="bg-white px-6 sm:pb-[72px] pb-0 pt-[72px]">

          <div className="flex  max-w-[1176px] mx-auto flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left: Text content */}
            <div className="flex flex-col gap-7 flex-1 max-w-[522px]">
              <h2 className="font-[Outfit] sm:text-[clamp(28px,3.8vw,44px)] text-[clamp(20px,3.8vw,44px)] font-semibold text-[#121212] leading-[1.32]">
                Find the Right Opportunities with AI-Powered Insights
              </h2>
              <p className="font-inter sm:text-base text-[#212121] leading-[26px] opacity-[0.96] text-[15px]">
                Search regular teachers or schools, filter reports instantly, and uncover trends through intelligent sentiment analysis helping you make faster and more informed decisions.
              </p>
            </div>
            <img src="/homeImage3.svg" alt="Image" className="sm:hidden w-full h-auto" />
            {/* Right: Search & filter UI mockup */}
            <div className="relative sm:block hidden w-full max-w-[534px] flex-shrink-0 rounded-[32px] bg-[#F8F9FD] overflow-hidden aspect-[534/396]">

              {/* White inner card */}
              <div
                className=" absolute rounded-xl bg-white"
                style={{
                  left: '5.6%', top: '7.6%',
                  width: '84.8%', height: '84.8%',
                  boxShadow: '0 4px 36px 0 rgba(1, 113, 249, 0.06)',
                }}
              />

              {/* Search input */}
              <div
                className="absolute flex items-center gap-2 rounded-full bg-[#F2F4F7] overflow-hidden"
                style={{ left: '9.4%', top: '12.6%', width: '77.3%', height: '10.1%', padding: '12px 20px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M13.0667 14L8.86667 9.8C8.53333 10.0667 8.15 10.2778 7.71667 10.4333C7.28333 10.5889 6.82222 10.6667 6.33333 10.6667C5.12222 10.6667 4.09733 10.2471 3.25867 9.408C2.42 8.56889 2.00044 7.544 2 6.33333C1.99956 5.12267 2.41911 4.09778 3.25867 3.25867C4.09822 2.41956 5.12311 2 6.33333 2C7.54356 2 8.56867 2.41956 9.40867 3.25867C10.2487 4.09778 10.668 5.12267 10.6667 6.33333C10.6667 6.82222 10.5889 7.28333 10.4333 7.71667C10.2778 8.15 10.0667 8.53333 9.8 8.86667L14 13.0667L13.0667 14ZM6.33333 9.33333C7.16667 9.33333 7.87511 9.04178 8.45867 8.45867C9.04222 7.87556 9.33378 7.16711 9.33333 6.33333C9.33289 5.49956 9.04133 4.79133 8.45867 4.20867C7.876 3.626 7.16756 3.33422 6.33333 3.33333C5.49911 3.33244 4.79089 3.62422 4.20867 4.20867C3.62644 4.79311 3.33467 5.50133 3.33333 6.33333C3.332 7.16533 3.62378 7.87378 4.20867 8.45867C4.79356 9.04356 5.50178 9.33511 6.33333 9.33333Z" fill="#737786" />
                </svg>
                <span className="font-inter text-sm text-[rgba(115,119,134,0.6)]">Search...</span>
              </div>

              {/* Skeleton lines block */}
              <div className="absolute  top-[17.9%] h-[47%] bg-[#F8F9FD] rounded-2xl" style={{ left: '9.4%', top: '27.8%', width: '77.3%', height: '36.4%' }}>
                <div className="absolute left-3.5 top-3.5 h-[13px] w-[80%] rounded-[10px] bg-[#E6E6E6]"></div>
                <div className="absolute left-3.5 top-[39px] h-[13px] w-[90%] rounded-[10px] bg-[#E6E6E6]"></div>
                <div className="absolute left-3.5 top-16 h-[13px] w-[64%] rounded-[10px] bg-[#E6E6E6]"></div>
                <div className="absolute left-3.5 top-[89px] h-[13px] w-[64%] rounded-[10px] bg-[#E6E6E6]"></div>
                <div className="absolute left-3.5 top-[114px] h-[13px] w-[67%] rounded-[10px] bg-[#E6E6E6]"></div>
              </div>

              {/* Bottom gray placeholder block */}
              <div
                className="absolute rounded-2xl bg-[#F4F4F4]"
                style={{ left: '9.4%', top: '66.2%', width: '77.3%', height: '20.2%' }}
              />

              {/* "Clear Insights" floating card */}
              <div
                className="absolute rounded-[20px] bg-white"
                style={{
                  left: '50.4%', top: '54%',
                  width: '47.2%', height: '26.3%',
                  border: '1px solid #F9F9F9',
                  boxShadow: '0 10px 50px -12px rgba(0, 0, 0, 0.16)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <span
                  className="absolute font-inter font-semibold text-black"
                  style={{ left: '20px', top: '20px', fontSize: '16px', lineHeight: '18px' }}
                >
                  Clear Insights
                </span>
                <div className="absolute flex items-center gap-3" style={{ left: '20px', top: '56px' }}>
                  {/* Positive badge */}
                  <div className="flex items-center gap-1.5 rounded-[10px] bg-[rgba(47,175,0,0.20)] px-2 py-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.0007 14.0001H5.33398V5.33342L10.0007 0.666748L10.834 1.50008C10.9118 1.57786 10.9758 1.68341 11.026 1.81675C11.0762 1.95008 11.1011 2.07786 11.1007 2.20008V2.43341L10.3673 5.33342H14.0007C14.3562 5.33342 14.6673 5.46675 14.934 5.73342C15.2007 6.00008 15.334 6.31119 15.334 6.66675V8.00008C15.334 8.07786 15.3258 8.16119 15.3093 8.25008C15.2929 8.33897 15.2678 8.4223 15.234 8.50008L13.234 13.2001C13.134 13.4223 12.9673 13.6112 12.734 13.7667C12.5007 13.9223 12.2562 14.0001 12.0007 14.0001ZM4.00065 5.33342V14.0001H1.33398V5.33342H4.00065Z" fill="#2FAF00" />
                    </svg>
                    <span className="font-inter font-medium text-[#2FAF00]" style={{ fontSize: '14px', lineHeight: '18px' }}>Positive</span>
                  </div>
                  {/* Negative badge */}
                  <div className="flex items-center gap-1.5 rounded-[10px] bg-[rgba(255,0,0,0.20)] px-2 py-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.0007 1.99992H5.33398V10.6666L10.0007 15.3333L10.834 14.4999C10.9118 14.4221 10.9758 14.3166 11.026 14.1833C11.0762 14.0499 11.1011 13.9221 11.1007 13.7999V13.5666L10.3673 10.6666H14.0007C14.3562 10.6666 14.6673 10.5333 14.934 10.2666C15.2007 9.99992 15.334 9.68881 15.334 9.33325V7.99992C15.334 7.92214 15.3258 7.83881 15.3093 7.74992C15.2929 7.66103 15.2678 7.5777 15.234 7.49992L13.234 2.79992C13.134 2.5777 12.9673 2.38881 12.734 2.23325C12.5007 2.0777 12.2562 1.99992 12.0007 1.99992ZM4.00065 10.6666V1.99992H1.33398V10.6666H4.00065Z" fill="#F32121" />
                    </svg>
                    <span className="font-inter font-medium text-[#F32121]" style={{ fontSize: '14px', lineHeight: '18px' }}>Negative</span>
                  </div>
                </div>
              </div>

              {/* "Filter results" floating badge */}
              <div
                className="absolute flex items-center gap-2.5 rounded-[20px] bg-white overflow-hidden"
                style={{
                  left: '69.7%', top: '22.2%',
                  padding: '6px 16px 6px 6px',
                  border: '1px solid #F9F9F9',
                  boxShadow: '0 10px 50px -12px rgba(0, 0, 0, 0.16)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <div className="relative w-9 h-9 flex-shrink-0">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="18" fill="url(#filter-grad)" />
                    <defs>
                      <linearGradient id="filter-grad" x1="2.17462" y1="-21.1457" x2="57.8353" y2="6.78517" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-2 top-2">
                    <path d="M11.6667 14.1667C11.8791 14.1669 12.0834 14.2483 12.2378 14.3941C12.3923 14.5399 12.4852 14.7391 12.4976 14.9512C12.5101 15.1632 12.4411 15.372 12.3048 15.5349C12.1685 15.6978 11.9751 15.8024 11.7642 15.8275L11.6667 15.8334H8.33333C8.12093 15.8331 7.91664 15.7518 7.76219 15.606C7.60775 15.4602 7.5148 15.2609 7.50236 15.0489C7.48991 14.8368 7.5589 14.628 7.69522 14.4652C7.83155 14.3023 8.02492 14.1976 8.23583 14.1725L8.33333 14.1667H11.6667ZM14.1667 9.16669C14.3877 9.16669 14.5996 9.25448 14.7559 9.41076C14.9122 9.56705 15 9.77901 15 10C15 10.221 14.9122 10.433 14.7559 10.5893C14.5996 10.7456 14.3877 10.8334 14.1667 10.8334H5.83333C5.61232 10.8334 5.40036 10.7456 5.24408 10.5893C5.0878 10.433 5 10.221 5 10C5 9.77901 5.0878 9.56705 5.24408 9.41076C5.40036 9.25448 5.61232 9.16669 5.83333 9.16669H14.1667ZM16.6667 4.16669C16.8877 4.16669 17.0996 4.25448 17.2559 4.41076C17.4122 4.56705 17.5 4.77901 17.5 5.00002C17.5 5.22103 17.4122 5.433 17.2559 5.58928C17.0996 5.74556 16.8877 5.83335 16.6667 5.83335H3.33333C3.11232 5.83335 2.90036 5.74556 2.74408 5.58928C2.5878 5.433 2.5 5.22103 2.5 5.00002C2.5 4.77901 2.5878 4.56705 2.74408 4.41076C2.90036 4.25448 3.11232 4.16669 3.33333 4.16669H16.6667Z" fill="white" />
                  </svg>
                </div>
                <span className="font-inter font-medium text-[#191C1D] whitespace-nowrap" style={{ fontSize: '14px', lineHeight: '18px' }}>Filter results</span>
              </div>

            </div>
          </div>
        </section>

        {/* How to Make Smarter Teaching Decisions in 3 Steps Section */}
        <section className="bg-white px-6 sm:pb-[72px] pb-0 pt-[72px]">
          <div className="max-w-[1176px] mx-auto flex flex-col items-center gap-12">

            {/* Heading */}
            <h2 className="font-[Outfit] sm:text-[clamp(28px,4vw,48px)] text-[clamp(20px,4vw,48px)] font-bold text-gray-950 text-center leading-[1.2] max-w-[640px]">
              How to Make Smarter Teaching Decisions in 3 Steps
            </h2>

            {/* Steps row */}
            <div className="w-full flex flex-col md:flex-row justify-center items-center">

              {/* Step 1 */}
              <div className="flex flex-col gap-5 flex-1 px-6 py-2 md:py-0 items-center">
                <Image src="/one.svg" height={100} width={100} className="w-[50px] h-[50px]" alt="Icon" />

                <h3 className="font-[Outfit] sm:text-[22px] text-[18px] font-bold text-gray-950 leading-[1.3]">
                  Submit Your Experience
                </h3>
                <p className="font-inter sm:text-base text-[15px] font-normal text-center text-gray-700 leading-[26px] text-center">
                  Share detailed classroom insights with the option to remain anonymous.
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px self-stretch bg-gray-200 flex-shrink-0" />
              <div className="md:hidden h-px w-[250px] bg-gray-200 my-6" />

              {/* Step 2 */}
              <div className="flex flex-col gap-5 flex-1 px-6 py-2 md:py-0 items-center">
                <Image src="/two.svg" height={100} width={100} className="w-[50px] h-[50px]" alt="Icon" />
                <h3 className="font-[Outfit] sm:text-[22px] text-[18px] font-bold text-gray-950 leading-[1.3]">
                  AI Analyzes &amp; Structures
                </h3>
                <p className="font-inter sm:text-base text-[15px] font-normal text-gray-700 leading-[26px]  text-center">
                  Your report is reviewed, categorized with AI-powered sentiment insights to ensure clarity and consistency.
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px self-stretch bg-gray-200 flex-shrink-0  items-center" />
              <div className="md:hidden h-px w-[250px] bg-gray-200 my-6" />

              {/* Step 3 */}
              <div className="flex flex-col gap-5 flex-1 px-6 py-2 md:py-0  items-center">
                <Image src="/three.svg" height={100} width={100} className="w-[50px] h-[50px]" alt="Icon" />
                <h3 className="font-[Outfit] sm:text-[22px] text-[18px] font-bold text-gray-950 leading-[1.3]">
                  Explore &amp; Decide
                </h3>
                <p className="font-inter sm:text-base text-[15px] font-normal text-gray-700 leading-[26px]   text-center">
                  Search reports, review regular teacher profiles, and understand patterns before accepting assignments.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Recent Reports Experiences Section */}
        {recentReports.length > 0 && (
          <section className="bg-white sm:px-9 px-6 py-[35px] pb-[80px]">
            <div className="rounded-[28px] bg-[#F8F9FD] sm:p-14 px-4 pt-10 flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">

              {/* Left: heading, subtitle, stats */}
              <div className="flex flex-col justify-between gap-10 flex-shrink-0 lg:w-[556px]">
                <div className="flex flex-col sm:gap-8 gap-4">
                  <h2 className="font-[Outfit] sm:text-[clamp(28px,3.2vw,44px)] text-[clamp(20px,3.2vw,44px)] font-semibold text-[#121212] leading-[1.32]">
                    Recent Reports <br></br> Experiences
                  </h2>
                  <p className="font-inter sm:text-base text-[15px] text-[#212121] leading-[26px] opacity-[0.96] max-w-[492px]">
                    Real insights shared by Guest teacher to help you better understand schools and teaching environments.
                  </p>
                </div>
                <div className="flex items-start gap-12">
                  <div className="flex flex-col gap-5">
                    <span className="font-[Outfit] sm:text-5xl text-3xl font-semibold text-[#121212] opacity-[0.96]">{formatCount(totalReports)}</span>
                    <span className="font-inter text-base text-[#212121] leading-[26px] tracking-[1px] uppercase opacity-80">Reports</span>
                  </div>
                  <div className="flex flex-col gap-5">
                    <span className="font-[Outfit] sm:text-5xl text-3xl font-semibold text-[#121212] opacity-[0.96]">{formatCount(totalSchools)}</span>
                    <span className="font-inter text-base text-[#212121] leading-[26px] tracking-[1px] uppercase opacity-80">Schools</span>
                  </div>
                </div>
              </div>

              {/* Right: review cards */}
              <div className="flex flex-col gap-5 flex-1 min-w-0">
                {recentReports.map((report: any, index: number) => {
                  const sc = getSentiment(report);
                  const createdDate = new Date(report.created_at);
                  const now = new Date();
                  const diffTime = now.getTime() - createdDate.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  const daysAgo = diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

                  return (
                    <div key={index} className="flex flex-col gap-4 p-4 rounded-[20px] border border-[rgba(219,219,219,0.40)] bg-white backdrop-blur-[5px]">
                      <div className="flex sm:items-center items-start justify-between">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex sm:items-center items-start sm:gap-3 gap-1.5 flex-col sm:flex-row">
                            <span className="font-inter text-sm font-bold text-[#121212] leading-5">{report.school_name}</span>
                            {report.grade_level && (
                              <span className="font-inter text-xs text-[#464555] leading-[15px] tracking-[0.5px] uppercase opacity-80">Grade Level: {report.grade_level}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LocationIcon />
                            <span className="font-outfit font-normal text-xs sm:text-sm text-[#414141] leading-7">
                              {[report.schools.city, report.schools.state].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className={`flex px-[13px] py-[5px] rounded ${sc.bg}`}>
                          <span className={`font-inter text-xs font-semibold ${sc.text} leading-[15px]`}>{sc.label}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="px-[18px] py-2.5 rounded-lg bg-[#F8F9FD]">
                          <p className="font-inter text-sm text-[#464555] leading-6">{report.feedback}</p>
                        </div>
                        <div className="flex sm:items-center items-start justify-between">
                          <div className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.73464 15L4.46797 12.8667L2.06797 12.3333L2.3013 9.86667L0.667969 8L2.3013 6.13333L2.06797 3.66667L4.46797 3.13333L5.73464 1L8.0013 1.96667L10.268 1L11.5346 3.13333L13.9346 3.66667L13.7013 6.13333L15.3346 8L13.7013 9.86667L13.9346 12.3333L11.5346 12.8667L10.268 15L8.0013 14.0333L5.73464 15ZM6.3013 13.3L8.0013 12.5667L9.73464 13.3L10.668 11.7L12.5013 11.2667L12.3346 9.4L13.568 8L12.3346 6.56667L12.5013 4.7L10.668 4.3L9.7013 2.7L8.0013 3.43333L6.26797 2.7L5.33464 4.3L3.5013 4.7L3.66797 6.56667L2.43464 8L3.66797 9.4L3.5013 11.3L5.33464 11.7L6.3013 13.3ZM7.3013 10.3667L11.068 6.6L10.1346 5.63333L7.3013 8.46667L5.86797 7.06667L4.93464 8L7.3013 10.3667Z" fill="#0171F9" />
                            </svg>
                            <span className="font-inter text-xs text-[#0171F9] leading-4">Verified User</span>
                          </div>
                          <span className="font-inter text-xs text-[#777587] leading-4">{daysAgo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
