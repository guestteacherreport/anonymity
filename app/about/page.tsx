import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";

// ── Reusable sub-components ──────────────────────────────────────────────────

function SectionBadge({ label }: { label: string }) {
  return (
    <div className="w-fit inline-flex px-[23px] mb-2 py-1.5 rounded-lg bg-[#001B3B]"><span className="font-inter  text-sm text-[#F8FAFF] leading-4">{label}</span></div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex gap-2 justify-center flex-col px-4 sm:px-10 py-6 sm:py-8 rounded-2xl border border-[rgba(1,113,249,0.10)] bg-white shadow-[0_2px_9.9px_0_rgba(0,0,0,0.06)]">
      <span className="text-center font-[Outfit] text-[20px] sm:text-[40px] font-semibold leading-[normal] bg-gradient-to-r from-[#29ABE2] to-[#0171F9] bg-clip-text text-transparent">
        {number}
      </span>
      <span className="font-inter text-xs sm:text-base text-[#212121] leading-[26px] opacity-[0.96] text-center">{label}</span>
    </div>
  );
}

function CheckCircleIcon({ id }: { id: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-[8px]">
      <path d="M16.9997 31.1668C24.8237 31.1668 31.1663 24.8242 31.1663 17.0002C31.1663 9.17613 24.8237 2.8335 16.9997 2.8335C9.17564 2.8335 2.83301 9.17613 2.83301 17.0002C2.83301 24.8242 9.17564 31.1668 16.9997 31.1668Z" stroke={`url(#cco_a_${id})`} strokeWidth="1.5" />
      <path d="M12.041 17.7085L14.8743 20.5418L21.9577 13.4585" stroke={`url(#cco_b_${id})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id={`cco_a_${id}`} x1="4.54452" y1="-13.809" x2="48.3515" y2="8.17367" gradientUnits="userSpaceOnUse">
          <stop offset="0.184" stopColor="#29ABE2" />
          <stop offset="0.821" stopColor="#0171F9" />
        </linearGradient>
        <linearGradient id={`cco_b_${id}`} x1="12.64" y1="9.29788" x2="25.4909" y2="18.326" gradientUnits="userSpaceOnUse">
          <stop offset="0.184" stopColor="#29ABE2" />
          <stop offset="0.821" stopColor="#0171F9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-white">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="bg-[#F8F9FD] px-6 py-16 md:py-20 lg:py-28 text-center">
          <SectionBadge label="About Us" />
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <h1 className="font-inter md:text-[clamp(36px,5vw,64px)] text-[clamp(30px,5vw,64px)] font-bold leading-[normal] text-[#121212]">
              Built for Guest Teachers,
              <br />
              <span className="bg-gradient-to-r from-[#29ABE2] to-[#0171F9] leading-[normal] bg-clip-text text-transparent">
                By Guest Teachers
              </span>
            </h1>
            <p className="mb-2 max-w-[615px] font-inter text-sm md:text-base text-[#212121] leading-[26px] opacity-[0.96]">
              Guest Teacher Report exists to give substitute educators the knowledge, community, and confidence they deserve before they ever step through a classroom door.
            </p>
            <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center w-full">
              <Link
                href="/browse-school"
                className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-xl bg-[#0171F9] text-white font-inter text-sm md:text-base font-bold leading-6 hover:bg-blue-700 transition-colors shadow-[0_10px_15px_-3px_rgba(1,113,249,0.06),0_4px_6px_-4px_rgba(1,113,249,0.12)]"
              >
                Browse Schools
              </Link>
              <Link
                href="/submit-report"
                className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-xl border border-black/20 bg-white text-[#2C3031] font-inter text-sm md:text-base font-bold leading-6 hover:border-black/40 transition-colors"
              >
                Submit a Report
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="pt-12 md:pt-[112px] bg-white px-6 pb-12 md:pb-[112px] text-center">
          <SectionBadge label="How its Work" />
          <div className="flex flex-col items-center gap-8 md:gap-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="font-[Outfit] md:text-[clamp(28px,4vw,44px)] text-[clamp(22px,4vw,44px)] font-semibold text-[#121212] leading-[1.32]">
                How Guest Teacher Report Works
              </h2>
              <p className="font-inter text-base text-[#212121] leading-[26px] opacity-[0.96] max-w-[600px]">
                A simple three-step loop that keeps the community informed, honest, and growing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1100px] px-6 md:px-0">
              {/* Card 1 */}
              <div className="relative text-left flex flex-col gap-5 p-6 sm:p-7 rounded-[26px] bg-[#F8F9FD] overflow-hidden">
                <div className="flex justify-between items-center mb-[15px]">
                  <svg className="mt-[-7px]" width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44.25 9.83337C46.206 9.83337 48.0818 10.6104 49.4649 11.9935C50.848 13.3765 51.625 15.2524 51.625 17.2084V36.875C51.625 38.831 50.848 40.7069 49.4649 42.09C48.0818 43.473 46.206 44.25 44.25 44.25H31.9583L19.6667 51.625V44.25H14.75C12.794 44.25 10.9182 43.473 9.53509 42.09C8.15201 40.7069 7.375 38.831 7.375 36.875V17.2084C7.375 15.2524 8.15201 13.3765 9.53509 11.9935C10.9182 10.6104 12.794 9.83337 14.75 9.83337H44.25Z" stroke="#525252" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="29.5" cy="33.5" r="1.5" fill="url(#hw1a)" />
                    <path d="M29 20V28" stroke="url(#hw1b)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="hw1a" x1="28.18" y1="30.24" x2="32.82" y2="32.57" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                      <linearGradient id="hw1b" x1="29.06" y1="15.3" x2="30.99" y2="15.42" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                  <span className="font-[Outfit] text-[60px] font-semibold text-[#2C3031]/[0.02] leading-8 select-none">01</span>

                </div>
                <h3 className="font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8">Submit a Report</h3>
                <p className="font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                  After a school day, submit an anonymous review covering lesson plans, student behavior, staff support, and your overall experience. Takes under 3 minutes.
                </p>
              </div>

              {/* Card 2 */}
              <div className="relative text-left flex flex-col gap-5 p-6 sm:p-7 rounded-[26px] bg-[#F8F9FD] overflow-hidden">
                <div className="flex justify-between items-center mb-[15px]">
                  <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.375 5.375V34.0417C5.375 34.992 5.75253 35.9035 6.42453 36.5755C7.09654 37.2475 8.00797 37.625 8.95833 37.625H37.625" stroke="#525252" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M34.042 16.125L25.0837 25.0833L17.917 17.9167L12.542 23.2917" stroke="url(#hw2a)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="hw2a" x1="13.84" y1="10.86" x2="30.82" y2="31.31" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                  <span className="font-[Outfit] text-[60px] font-semibold text-[#2C3031]/[0.02] leading-8 select-none">02</span>

                </div>
                <h3 className="mt-[10px] font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8">Data Gets Analyzed</h3>
                <p className="font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                  Every report feeds our insight engine. We surface sentiment trends, recurring issues, and what&apos;s working well turning raw feedback into useful signals.
                </p>
              </div>

              {/* Card 3 */}
              <div className="relative text-left flex flex-col gap-5 p-6 sm:p-7 rounded-[26px] bg-[#F8F9FD] overflow-hidden">
                <div className="flex justify-between items-center mb-[15px]">
                  <svg width="70" height="40" viewBox="0 0 70 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.75 38V34.9583C19.75 30.9248 21.3523 27.0565 24.2044 24.2044C27.0565 21.3523 30.9248 19.75 34.9583 19.75M34.9583 19.75C38.9918 19.75 42.8601 21.3523 45.7122 24.2044C48.5644 27.0565 50.1667 30.9248 50.1667 34.9583V38M34.9583 19.75C37.3784 19.75 39.6994 18.7886 41.4107 17.0774C43.122 15.3661 44.0833 13.0451 44.0833 10.625C44.0833 8.2049 43.122 5.88392 41.4107 4.17265C39.6994 2.46138 37.3784 1.5 34.9583 1.5C32.5382 1.5 30.2173 2.46138 28.506 4.17265C26.7947 5.88392 25.8333 8.2049 25.8333 10.625C25.8333 13.0451 26.7947 15.3661 28.506 17.0774C30.2173 18.7886 32.5382 19.75 34.9583 19.75Z" stroke="#525252" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M67.7083 37.8333V34.7917C67.7083 32.3716 66.747 30.0506 65.0357 28.3393C63.3244 26.628 61.0034 25.6667 58.5833 25.6667M58.5833 25.6667C60.1967 25.6667 61.7441 25.0257 62.8849 23.8849C64.0257 22.7441 64.6667 21.1967 64.6667 19.5833C64.6667 17.9699 64.0257 16.4226 62.8849 15.2818C61.7441 14.1409 60.1967 13.5 58.5833 13.5C56.9699 13.5 55.4226 14.1409 54.2818 15.2818C53.1409 16.4226 52.5 17.9699 52.5 19.5833C52.5 21.1967 53.1409 22.7441 54.2818 23.8849C55.4226 25.0257 56.9699 25.6667 58.5833 25.6667Z" stroke="url(#paint0_linear_692_1106)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.5 38.0001V34.9584C1.5 32.5383 2.46138 30.2173 4.17265 28.5061C5.88392 26.7948 8.2049 25.8334 10.625 25.8334M10.625 25.8334C12.2384 25.8334 13.7857 25.1925 14.9266 24.0516C16.0674 22.9108 16.7083 21.3635 16.7083 19.7501C16.7083 18.1367 16.0674 16.5894 14.9266 15.4485C13.7857 14.3077 12.2384 13.6667 10.625 13.6667C9.0116 13.6667 7.46428 14.3077 6.32343 15.4485C5.18259 16.5894 4.54167 18.1367 4.54167 19.7501C4.54167 21.3635 5.18259 22.9108 6.32343 24.0516C7.46428 25.1925 9.0116 25.8334 10.625 25.8334Z" stroke="url(#paint1_linear_692_1106)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="paint0_linear_692_1106" x1="53.4187" y1="-0.792954" x2="80.2178" y2="7.61202" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_692_1106" x1="2.41868" y1="-0.626206" x2="29.2178" y2="7.77877" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="font-[Outfit] text-[60px] font-semibold text-[#2C3031]/[0.02] leading-8 select-none">03</span>


                </div>
                <h3 className="mt-[10px] font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8">Community Benefits</h3>
                <p className="font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                  Guest teachers browse real ratings before accepting assignments. Schools gain honest feedback to improve working conditions. Everyone wins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE HESITANT SUBSTITUTE ───────────────────────────────────── */}
        <section className="">
          <div className="rounded-[28px] bg-[#F8F9FD] px-10 md:px-30 py-[112px]">
            {/* Left: text */}

            <SectionBadge label="The Problem" />
            <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
              <div className="flex flex-col gap-6 flex-1">
                <h2 className="font-[Outfit] md:text-[clamp(28px,3.8vw,50px)] text-[clamp(22px,3.8vw,50px)] font-semibold text-[#121212] leading-[1.32]">
                  The Hesitant Substitute
                </h2>
                <div className="flex flex-col gap-5 font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96] w-full lg:w-[70%]">
                  <p>
                    Every guest teacher knows the feeling: the phone rings with a school assignment you&apos;ve never heard of, and you have no way to know what to expect. Are the lesson plans ready? Will the staff support you? Are the students manageable?
                  </p>
                  <p>
                    Without information, you&apos;re forced to guess. Some accept assignments at shady schools repeatedly, burning out fast. Others turn down perfectly good placements out of an abundance of caution.
                  </p>
                  <p>
                    GTR was created to resolve this uncertainty, giving you the peer-sourced intelligence to make confident choices about where you spend your professional time.
                  </p>
                </div>
              </div>

              {/* Right: 2×2 stat cards */}
              <div className="grid grid-cols-2 gap-4 md:gap-5 w-full lg:w-auto lg:flex-shrink-0">
                <StatCard number="2,400+" label="Schools Reviewed" />
                <StatCard number="18,000+" label="Reports Submitted" />
                <StatCard number="6,500+" label="Guest Teachers" />
                <StatCard number="34" label="States Covered" />
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY GUEST TEACHER REPORT ──────────────────────────────────── */}
        <section className="bg-white px-6 py-[112px] text-center">
          <SectionBadge label="Our Why" />
          <div className="flex flex-col items-center gap-10 md:gap-14">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="font-[Outfit] md:text-[clamp(28px,4vw,44px)] text-[clamp(22px,4vw,44px)] font-semibold text-[#121212] leading-[1.32]">
                Why Guest Teacher Report?
              </h2>
              <p className="font-inter text-sm md:text-base text-[#212121] leading-[26px] opacity-[0.96] max-w-[650px]">
                Because substitute teachers are the unsung backbone of the education system and they deserve the same transparency that any professional community expects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full max-w-[1100px] px-6 md:px-0">
              {/* Anonymous & Safe */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 rounded-2xl border border-[rgba(1,113,249,0.10)] bg-[#F8F9FD] shadow-[0_4px_4px_0_rgba(0,0,0,0.08)] overflow-hidden p-6 sm:p-9">
                <div className="mt-[10px] flex-shrink-0 w-11 h-11 rounded-[9px] bg-[rgba(1,113,249,0.10)] flex items-center justify-center mr-4 sm:mr-6">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.298 2.195C11.6926 2.04735 12.1238 2.0281 12.53 2.14L12.702 2.195L19.702 4.82C20.0569 4.95309 20.3667 5.1843 20.5953 5.4867C20.8239 5.7891 20.9618 6.15022 20.993 6.528L21 6.693V12.056C21 13.6764 20.5624 15.2668 19.7336 16.6592C18.9048 18.0516 17.7154 19.1944 16.291 19.967L16.025 20.106L12.671 21.783C12.4863 21.8752 12.2846 21.9283 12.0785 21.939C11.8723 21.9496 11.6662 21.9176 11.473 21.845L11.329 21.783L7.975 20.106C6.52561 19.3813 5.29878 18.2787 4.424 16.9146C3.54923 15.5505 3.05898 13.9756 3.005 12.356L3 12.056V6.693C3.00001 6.31413 3.10763 5.94305 3.31033 5.62297C3.51304 5.30288 3.8025 5.04696 4.145 4.885L4.298 4.82L11.298 2.195ZM12 4.068L5 6.693V12.056C5.00003 13.311 5.33745 14.5429 5.97696 15.6228C6.61646 16.7026 7.53451 17.5907 8.635 18.194L8.87 18.317L12 19.882L15.13 18.317C16.2527 17.7557 17.2039 16.9029 17.8839 15.8479C18.5638 14.7928 18.9476 13.5743 18.995 12.32L19 12.056V6.693L12 4.068ZM15.433 8.629C15.613 8.44965 15.8544 8.34552 16.1084 8.33777C16.3623 8.33001 16.6097 8.41921 16.8003 8.58724C16.9908 8.75528 17.1103 8.98955 17.1344 9.24247C17.1585 9.49539 17.0854 9.748 16.93 9.949L16.847 10.043L11.613 15.278C11.4223 15.4686 11.1683 15.5826 10.8992 15.5983C10.63 15.6139 10.3645 15.5302 10.153 15.363L10.057 15.278L7.653 12.874C7.47175 12.6945 7.36597 12.4524 7.35732 12.1974C7.34867 11.9425 7.4378 11.6938 7.60647 11.5024C7.77513 11.311 8.01058 11.1913 8.26462 11.1678C8.51866 11.1443 8.77208 11.2188 8.973 11.376L9.067 11.459L10.835 13.227L15.433 8.629Z" fill="url(#anon_safe_g)" />
                    <defs>
                      <linearGradient id="anon_safe_g" x1="4.09" y1="-9.6" x2="32.96" y2="3.52" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="sm:text-left text-center font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8 mb-3">Anonymous &amp; Safe</h3>
                  <p className="sm:text-left text-center font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                    No names, no retaliation, no school politics. You choose what to share and how much to identify yourself.
                  </p>
                </div>
              </div>

              {/* Peer-Sourced Truth */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 rounded-2xl border border-[rgba(1,113,249,0.10)] bg-[#F8F9FD] shadow-[0_4px_4px_0_rgba(0,0,0,0.08)] overflow-hidden p-6 sm:p-9">
                <div className="mt-[10px] flex-shrink-0 w-11 h-11 rounded-[9px] bg-[rgba(1,113,249,0.10)] flex items-center justify-center mr-4 sm:mr-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 20H15V22H9V20ZM8.17 15.05C8.58 15.67 8.79 16.41 8.89 17H8V19H16V17H15.11C15.22 16.41 15.42 15.67 15.83 15.05C16.19 14.51 16.59 14.04 16.97 13.59C17.97 12.41 19 11.2 19 8.99001C19 5.13001 15.86 1.99001 12 1.99001C8.14 1.99001 5 5.13001 5 8.99001C5 11.2 6.03 12.41 7.02 13.57C7.41 14.02 7.8 14.49 8.17 15.04V15.05ZM12 4.00001C14.76 4.00001 17 6.24001 17 9.00001C17 10.47 16.38 11.2 15.45 12.3C15.05 12.77 14.6 13.3 14.17 13.94C13.49 14.97 13.2 16.17 13.08 17H10.91C10.79 16.17 10.51 14.97 9.83 13.95C9.4 13.3 8.94 12.76 8.54 12.29C7.61 11.2 7 10.48 7 9.00001C7 6.24001 9.24 4.00001 12 4.00001Z" fill="url(#peer_g)" />
                    <defs>
                      <linearGradient id="peer_g" x1="5.85" y1="-9.76" x2="29.97" y2="-1.29" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="sm:text-left text-center font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8 mb-3">Peer-Sourced Truth</h3>
                  <p className="sm:text-left text-center font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                    Ratings from real guest teachers who sat in that exact classroom — not marketing copy from a district office.
                  </p>
                </div>
              </div>

              {/* Community Power */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 rounded-2xl border border-[rgba(1,113,249,0.10)] bg-[#F8F9FD] shadow-[0_4px_4px_0_rgba(0,0,0,0.08)] overflow-hidden p-6 sm:p-9">
                <div className="mt-[10px] flex-shrink-0 w-11 h-11 rounded-[9px] bg-[rgba(1,113,249,0.10)] flex items-center justify-center mr-4 sm:mr-6">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.9997 12.8335C15.9947 12.8335 17.4997 11.3285 17.4997 9.3335C17.4997 7.3385 15.9947 5.8335 13.9997 5.8335C12.0047 5.8335 10.4997 7.3385 10.4997 9.3335C10.4997 11.3285 12.0047 12.8335 13.9997 12.8335ZM13.9997 8.16683C14.6997 8.16683 15.1663 8.6335 15.1663 9.3335C15.1663 10.0335 14.6997 10.5002 13.9997 10.5002C13.2997 10.5002 12.833 10.0335 12.833 9.3335C12.833 8.6335 13.2997 8.16683 13.9997 8.16683ZM15.1663 14.0002H12.833C9.61301 14.0002 6.99967 16.6135 6.99967 19.8335V20.4168C6.99967 21.3852 7.78134 22.1668 8.74967 22.1668H19.2497C20.218 22.1668 20.9997 21.3852 20.9997 20.4168V19.8335C20.9997 16.6135 18.3863 14.0002 15.1663 14.0002ZM9.33301 19.8335C9.33301 17.9085 10.908 16.3335 12.833 16.3335H15.1663C17.0913 16.3335 18.6663 17.9085 18.6663 19.8335H9.33301ZM7.58301 12.8335C8.13134 12.8335 8.63301 12.6935 9.06467 12.4485C8.57537 11.6694 8.27608 10.7863 8.19097 9.87025C8.10585 8.95423 8.23729 8.03103 8.57467 7.17516C8.27134 7.07016 7.93301 7.00016 7.58301 7.00016C5.90301 7.00016 4.66634 8.23683 4.66634 9.91683C4.66634 11.5968 5.90301 12.8335 7.58301 12.8335ZM7.12801 14.0002H6.41634C4.16467 14.0002 2.33301 15.8318 2.33301 18.0835V19.2502C2.33301 19.5768 2.58967 19.8335 2.91634 19.8335H4.66634C4.66634 17.5468 5.61134 15.4818 7.12801 14.0002ZM20.4163 12.8335C22.0963 12.8335 23.333 11.5968 23.333 9.91683C23.333 8.23683 22.0963 7.00016 20.4163 7.00016C20.0547 7.00016 19.728 7.07016 19.4247 7.17516C19.7621 8.03103 19.8935 8.95423 19.8084 9.87025C19.7233 10.7863 19.424 11.6694 18.9347 12.4485C19.3663 12.6935 19.8563 12.8335 20.4163 12.8335ZM21.583 14.0002H20.8713C21.6509 14.7585 22.2704 15.6654 22.6932 16.6674C23.1161 17.6694 23.3336 18.746 23.333 19.8335H25.083C25.4097 19.8335 25.6663 19.5768 25.6663 19.2502V18.0835C25.6663 15.8318 23.8347 14.0002 21.583 14.0002Z" fill="url(#comm_g)" />
                    <defs>
                      <linearGradient id="comm_g" x1="3.74" y1="-3.76" x2="33.57" y2="17.62" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="sm:text-left text-center font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8 mb-3">Community Power</h3>
                  <p className="sm:text-left text-center font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                    The more teachers share, the more accurate and useful the platform becomes for everyone.
                  </p>
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 rounded-2xl border border-[rgba(1,113,249,0.10)] bg-[#F8F9FD] shadow-[0_4px_4px_0_rgba(0,0,0,0.08)] overflow-hidden p-6 sm:p-9">
                <div className="mt-[10px] flex-shrink-0 w-11 h-11 rounded-[9px] bg-[rgba(1,113,249,0.10)] flex items-center justify-center mr-4 sm:mr-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.121 20.615C10.8461 20.4456 10.5613 20.293 10.268 20.158C9.535 19.819 8.557 19.5 7.5 19.5C6.221 19.5 5.062 19.968 4.32 20.362C4.08587 20.4848 3.82482 20.5473 3.56047 20.5438C3.29611 20.5403 3.0368 20.4709 2.806 20.342C2.56326 20.2116 2.36024 20.0181 2.21837 19.7819C2.0765 19.5457 2.00106 19.2755 2 19V6.5C2 5.879 2.295 5.237 2.898 4.871C3.672 4.401 5.414 3.5 7.5 3.5C9.081 3.5 10.645 4.01 12 4.81C13.355 4.01 14.919 3.5 16.5 3.5C18.586 3.5 20.328 4.4 21.102 4.871C21.705 5.237 22 5.879 22 6.5V19C22 19.633 21.621 20.106 21.194 20.342C20.9631 20.4711 20.7036 20.5406 20.439 20.5441C20.1745 20.5476 19.9133 20.485 19.679 20.362C18.938 19.968 17.779 19.5 16.5 19.5C15.443 19.5 14.465 19.82 13.732 20.158C13.4387 20.293 13.1539 20.4456 12.879 20.615C12.595 20.792 12.355 21 12.001 21C11.645 21 11.406 20.792 11.121 20.615ZM4 18.294V6.542C4.673 6.142 6 5.5 7.5 5.5C8.73 5.5 9.948 5.918 11 6.542V18.294C10.115 17.898 8.887 17.5 7.5 17.5C6.119 17.5 4.891 17.895 4 18.294ZM13 18.294C13.885 17.898 15.113 17.5 16.5 17.5C17.881 17.5 19.109 17.895 20 18.294V6.542C19.327 6.142 18 5.5 16.5 5.5C15.27 5.5 14.052 5.918 13 6.542V18.294Z" fill="url(#insights_g)" />
                    <defs>
                      <linearGradient id="insights_g" x1="3.21" y1="-6.78" x2="32.34" y2="9.93" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="sm:text-left text-center font-[Outfit] text-xl sm:text-2xl font-semibold text-[#2C3031] leading-8 mb-3">Actionable Insights</h3>
                  <p className="sm:text-left text-center font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                    Not just stars — detailed breakdowns of lesson preparedness, behavior, admin support, and more.
                  </p>
                </div>
              </div></div>
          </div>
        </section>

        {/* ── COMMUNITY GUIDELINES ─────────────────────────────────────── */}
        <section className="">
          <div className="rounded-[28px] bg-[#F8F9FD] px-6 md:px-10 lg:px-16 py-12 md:py-[112px] text-center mx-6 md:mx-0">
            <SectionBadge label="Community Standards" />
            <div className="flex flex-col items-center gap-14">
              <div className="flex flex-col items-center gap-3 text-center">
                <h2 className="font-[Outfit] md:text-[clamp(28px,4vw,44px)] text-[clamp(22px,4vw,44px)] font-semibold text-[#121212] leading-[1.32]">
                  Guest Teachers&apos; Community Guidelines
                </h2>
                <p className="font-inter text-sm md:text-base text-[#212121] leading-[26px] opacity-[0.96] max-w-[600px]">
                  GTR is only as trustworthy as its contributors. These guidelines keep our community fair, useful, and respectful.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-[1100px] px-0">
                {[
                  {
                    id: "g1", title: "Be honest, not hateful",
                    desc: "Critique working conditions and professional circumstances. Do not target individual students, staff members, or protected characteristics.",
                  },
                  {
                    id: "g2", title: "Write from personal experience",
                    desc: "Only submit reports for assignments you personally completed. Secondhand or fabricated reviews undermine the whole community.",
                  },
                  {
                    id: "g3", title: "Be specific and constructive",
                    desc: "Vague ratings help no one. Mention what lesson materials were like, how behavior was managed, whether admin was accessible.",
                  },
                  {
                    id: "g4", title: "Respect anonymity — yours and others'",
                    desc: "Don't include identifying information about specific students or staff. Protect the privacy of the classroom.",
                  },
                  {
                    id: "g5", title: "One report per assignment",
                    desc: "Submitting multiple reviews of the same placement inflates data and distorts ratings for others in the community.",
                  },
                  {
                    id: "g6", title: "No promotional content",
                    desc: "GTR is not a place for staffing agency ads, tutoring promos, or unrelated solicitation of any kind.",
                  },
                ].map((g) => (
                  <div key={g.id} className="flex sm:flex-row flex-col items-center sm:items-start gap-4 sm:gap-5 p-6 sm:p-7 rounded-2xl border border-[rgba(1,113,249,0.10)] bg-white shadow-[0_2px_9.9px_0_rgba(0,0,0,0.06)]">
                    <CheckCircleIcon id={g.id} />
                    <div>
                      <h3 className="sm:text-left text-center font-[Outfit] text-lg sm:text-2xl font-semibold text-[#2C3031] leading-8 mb-2">{g.title}</h3>
                      <p className="font-inter sm:text-left text-center text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div></div>
          </div>
        </section>

        {/* ── ABOUT GUEST TEACHER REPORT (WHO WE ARE) ──────────────────── */}
        <section className="bg-white px-6 py-12 md:py-[112px] flex flex-col items-center gap-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-10 lg:gap-16 w-full max-w-[1100px]">
            {/* Left: quote card */}
            <div
              className="relative flex-shrink-0 w-full lg:max-w-[471px] rounded-[26px] overflow-hidden p-7 sm:p-9 flex flex-col gap-6 sm:gap-8"
              style={{ background: "linear-gradient(117deg, #0171F9 7.46%, #29ABE2 89.56%)", minHeight: "auto" }}
            >
              {/* Decorative circles */}
              <div className="absolute right-[-20px] bottom-[-20px] w-[150px] h-[150px] rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute left-[-54px] top-[-40px] w-[150px] h-[150px] rounded-full bg-white/10 pointer-events-none" />

              {/* Heart icon box */}
              <div className="relative w-[53px] h-[50px] rounded-[6px] bg-white/47 backdrop-blur-[4px] flex items-center justify-center flex-shrink-0">

                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.2898 20.6599C11.4898 20.8599 11.7398 20.9499 11.9998 20.9499C12.2598 20.9499 12.5098 20.8499 12.7098 20.6599L20.2098 13.1599C22.5598 10.8099 22.5598 7.10995 20.2098 4.74995C17.9098 2.46995 14.3598 2.39995 11.9998 4.54995C9.63984 2.39995 6.08984 2.45995 3.78984 4.74995C1.43984 7.10995 1.43984 10.8099 3.78984 13.1599L11.2898 20.6599ZM5.20984 6.15995C5.99984 5.37995 6.99984 4.98995 8.00984 4.98995C9.01984 4.98995 10.0198 5.37995 10.7998 6.15995L11.2998 6.65995C11.6898 7.04995 12.3198 7.04995 12.7098 6.65995L13.2098 6.15995C14.7698 4.59995 17.2298 4.59995 18.7998 6.15995C20.3598 7.72995 20.3598 10.1799 18.7998 11.7399L12.0098 18.5299L5.21984 11.7399C4.84915 11.376 4.55471 10.9418 4.35371 10.4628C4.15271 9.98373 4.04919 9.46945 4.04919 8.94995C4.04919 8.43045 4.15271 7.91616 4.35371 7.43712C4.55471 6.95809 4.84915 6.52391 5.21984 6.15995H5.20984Z" fill="white" />
                </svg>

              </div>

              {/* Quote */}
              <p className="font-inter text-lg sm:text-xl font-normal text-white leading-[30px] sm:leading-[34px] opacity-[0.96] relative z-10">
                "We believe substitute teachers are professionals who deserve professional-grade information about their workplace."
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-px bg-white" />
                <span className="font-inter text-sm font-normal text-white/90">GTR Founding Team</span>
              </div>
            </div>

            {/* Right: text content */}
            <div className="w-full">
              <SectionBadge label="Who We Are" />
              <div className="flex flex-col gap-6 flex-1">
                <h2 className="font-[Outfit] sm:text-[clamp(28px,3.8vw,50px)] text-[clamp(22px,3.8vw,50px)] font-semibold text-[#121212] leading-[1.32]">
                  About Guest Teacher Report
                </h2>
                <div className="flex flex-col gap-4 sm:gap-5 font-inter text-sm sm:text-base text-[#212121] leading-[26px] opacity-[0.96]">
                  <p>
                    Guest Teacher Report is an independent platform founded by former substitute teachers and educators who experienced firsthand the challenges of walking into an unfamiliar school. We&apos;re not affiliated with any school district, staffing agency, or government body.
                  </p>
                  <p>
                    Our team spans educators, technologists, and community builders who are committed to a simple belief: better information creates better outcomes — for teachers, for students, and for schools.
                  </p>
                  <p>
                    Every feature we build and every improvement we make is guided by one goal: to remain a free, trusted resource for all guest teachers across the United States and beyond.
                  </p>
                </div></div>
            </div>
          </div>
        </section>

        {/* ── HOW SCHOOLS & DISTRICTS BENEFIT ──────────────────────────── */}
        <section className="">

          <div className="rounded-[28px] bg-[#F8F9FD] px-6 md:px-10 lg:px-16 py-12 md:py-[112px] text-center mx-6 md:mx-0">
            <SectionBadge label="For Schools" />
            <div className="flex flex-col items-center gap-14">
              <div className="flex flex-col items-center gap-3 text-center">
                <h2 className="font-[Outfit] md:text-[clamp(28px,4vw,44px)] text-[clamp(22px,4vw,44px)] font-semibold text-[#121212] leading-[1.32]">
                  How Schools &amp; Districts Benefit
                </h2>
                <p className="font-inter text-sm md:text-base text-[#212121] leading-[26px] opacity-[0.96] max-w-[645px]">
                  GTR isn&apos;t just for guest teachers. Forward-thinking schools use the platform to attract better subs and continuously improve.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-0 w-full max-w-[1100px] px-0">
                {[
                  {
                    img: "/one.svg",
                    title: "Attract Quality Subs",
                    desc: "Schools with high ratings become first-choice destinations. Great reviews mean guest teachers actively seek out your assignments.",
                  },
                  {
                    img: "/two.svg",
                    title: "Honest Feedback Loop",
                    desc: "Aggregate reports surface systemic issues — from missing lesson plans to administration gaps that formal channels often miss.",
                  },
                  {
                    img: "/three.svg",
                    title: "Improve Retention",
                    desc: "When guest teachers feel supported, schools experience lower hiring costs and maintain a consistent, stable classroom environment.",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-stretch flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-4 md:gap-5 flex-1 px-6 py-6 md:py-0">
                      {step.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <Image src={step.img} height={100} width={100} className="w-[50px] h-[50px]" alt="Icon" />
                      ) : (
                        /* Inline numbered circle for step 3 */
                        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(117deg, #29ABE2 8.11%, #0171F9 90.2%)" }}>
                          <span className="font-[Outfit] text-xl font-bold text-white">3</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-4 md:gap-5">
                        <h3 className="font-[Outfit] text-lg sm:text-[22px] font-semibold text-[#121212] text-center leading-[normal]">{step.title}</h3>
                        <p className="font-inter text-sm sm:text-base font-normal text-center text-gray-700 leading-[26px]">{step.desc}</p>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:block w-px self-stretch bg-[#DADADA] opacity-72 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div></div>
          </div>
        </section>

        {/* ── MISSION, VISION & GOAL ────────────────────────────────────── */}
        <section className="bg-white px-6 py-12 md:py-[112px] text-center">
          <SectionBadge label="Our Direction" />
          <div className="flex flex-col items-center gap-8 md:gap-10">
            <h2 className="font-[Outfit] sm:text-[clamp(28px,4vw,44px)] text-[clamp(22px,4vw,44px)] font-semibold text-[#121212] text-center leading-[1.32]">
              Mission, Vision &amp; Goal Statement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1100px] px-6 md:px-0">
              {/* Mission */}
              <div className="rounded-[26px] bg-[#F8F9FD] overflow-hidden flex flex-col">
                <div className="flex items-center justify-center gap-3 px-6 sm:px-7 py-4 sm:py-5 bg-[rgba(1,113,249,0.06)]">

                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8558 14.1701C10.9967 14.0297 11.0761 13.839 11.0765 13.64C11.0769 13.441 10.9982 13.2501 10.8578 13.1091C10.7173 12.9681 10.5267 12.8887 10.3277 12.8883C10.1287 12.888 9.93773 12.9667 9.79677 13.1071L10.8558 14.1701ZM9.91977 7.42209C10.0869 7.52238 10.2865 7.55369 10.4762 7.50938C10.666 7.46508 10.8311 7.34863 10.9365 7.18472C11.042 7.0208 11.0794 6.82229 11.041 6.63122C11.0026 6.44015 10.8913 6.27153 10.7308 6.16109L9.91977 7.42209ZM12.4998 18.5001L11.9698 19.0301L12.0058 19.0641L12.4998 18.5001ZM17.8238 13.2321C17.7703 13.1494 17.701 13.078 17.6199 13.022C17.5388 12.9661 17.4474 12.9266 17.3511 12.906C17.1565 12.8642 16.9534 12.9015 16.7863 13.0096C16.6192 13.1177 16.5019 13.2877 16.4601 13.4823C16.4184 13.6768 16.4557 13.88 16.5638 14.0471L17.8238 13.2321ZM13.0228 18.9581L13.5528 18.4281L13.5348 18.4101L13.5168 18.3951L13.0228 18.9581ZM19.7638 10.0171L13.9168 15.8461L14.9768 16.9081L20.8228 11.0781L19.7638 10.0171ZM9.48277 15.8461L8.10877 14.4761L7.04977 15.5401L8.42377 16.9101L9.48277 15.8461ZM8.10877 10.0621L13.9568 4.23209L12.8968 3.17009L7.04977 9.00009L8.10877 10.0621ZM17.5468 2.75009H18.1158V1.25009H17.5458L17.5468 2.75009ZM21.2498 5.87309V6.44009H22.7498V5.87309H21.2498ZM18.1158 2.75009C19.0518 2.75009 19.6798 2.75209 20.1468 2.81409C20.5928 2.87409 20.7798 2.97709 20.9018 3.09809L21.9608 2.03609C21.5138 1.59009 20.9578 1.41009 20.3458 1.32809C19.7558 1.24809 19.0098 1.25009 18.1158 1.25009V2.75009ZM22.7498 5.87309C22.7498 4.98109 22.7518 4.23709 22.6718 3.64809C22.5898 3.03709 22.4078 2.48209 21.9608 2.03609L20.8998 3.09809C21.0218 3.21909 21.1248 3.40509 21.1848 3.84809C21.2468 4.31409 21.2498 4.93809 21.2498 5.87309H22.7498ZM8.10977 14.4771C7.44677 13.8171 7.00477 13.3731 6.71877 12.9991C6.44577 12.6431 6.38777 12.4391 6.38777 12.2691H4.88777C4.88777 12.9011 5.15277 13.4211 5.52777 13.9111C5.88877 14.3831 6.41777 14.9081 7.04977 15.5391L8.10977 14.4771ZM8.42277 16.9081C9.05477 17.5381 9.58277 18.0661 10.0558 18.4261C10.5468 18.8001 11.0678 19.0631 11.6998 19.0631V17.5631C11.5268 17.5631 11.3218 17.5041 10.9638 17.2331C10.5898 16.9471 10.1448 16.5061 9.48277 15.8461L8.42277 16.9081ZM20.8228 11.0781C21.6218 10.2831 22.1778 9.74609 22.4708 9.04209L21.0858 8.46709C20.9348 8.83109 20.6488 9.13409 19.7638 10.0171L20.8228 11.0781ZM21.2498 6.44009C21.2498 7.68909 21.2368 8.10309 21.0858 8.46709L22.4708 9.04209C22.7628 8.33809 22.7498 7.56609 22.7498 6.44009H21.2498ZM13.9558 4.23309C14.8408 3.35009 15.1458 3.06509 15.5108 2.91409L14.9388 1.52809C14.2338 1.81909 13.6958 2.37409 12.8968 3.17009L13.9558 4.23309ZM17.5458 1.25009C16.4158 1.25009 15.6438 1.23709 14.9388 1.52809L15.5108 2.91409C15.8768 2.76409 16.2948 2.75009 17.5468 2.75009L17.5458 1.25009ZM8.79577 16.2231L10.8558 14.1701L9.79677 13.1071L7.73677 15.1611L8.79577 16.2231ZM10.7308 6.16109L10.1018 5.75609L9.28977 7.01709L9.91977 7.42209L10.7308 6.16109ZM10.1018 5.75609C9.48077 5.35609 8.97877 5.03209 8.54777 4.80009C8.10577 4.56209 7.69277 4.39309 7.23577 4.32609L7.01677 5.81009C7.23677 5.84209 7.47677 5.92709 7.83577 6.12009C8.20377 6.31909 8.64977 6.60509 9.28977 7.01709L10.1018 5.75609ZM2.75477 8.55409C3.31316 7.98957 3.88328 7.43678 4.46477 6.89609C4.6997 6.67877 4.94322 6.47094 5.19477 6.27309C5.41777 6.10109 5.55977 6.01709 5.62677 5.98909L5.05177 4.60309C4.79477 4.71009 4.52477 4.89509 4.27877 5.08509C4.02077 5.28409 3.73877 5.52709 3.45277 5.78809C2.88077 6.31009 2.25277 6.93709 1.69577 7.49209L2.75477 8.55409ZM7.23577 4.32609C6.49611 4.21912 5.74129 4.31485 5.05177 4.60309L5.62677 5.98909C6.06529 5.80446 6.54568 5.74325 7.01677 5.81009L7.23577 4.32609ZM2.20777 9.97309L2.58677 10.1231L3.13877 8.72909L2.76077 8.57909L2.20777 9.97309ZM4.08277 11.1041L5.04277 12.0621L6.10277 11.0001L5.14377 10.0421L4.08277 11.1041ZM2.58677 10.1231L2.70077 10.1691L3.27177 8.78209L3.13877 8.72909L2.58677 10.1231ZM5.14177 10.0421L5.04077 9.94209L3.99577 11.0181L4.08277 11.1041L5.14177 10.0421ZM2.70077 10.1691C3.18277 10.3671 3.62177 10.6561 3.99577 11.0191L5.04077 9.94209C4.53015 9.44655 3.92977 9.05286 3.27177 8.78209L2.70077 10.1691ZM1.69577 7.49209C1.51764 7.66945 1.38647 7.88837 1.3141 8.12909C1.24173 8.36982 1.23044 8.62478 1.28124 8.87096C1.33205 9.11714 1.44335 9.3468 1.6051 9.53922C1.76686 9.73163 1.97398 9.88074 2.20777 9.97309L2.76077 8.57909L2.75377 8.57509L2.75077 8.56709V8.56009L2.75477 8.55409L1.69577 7.49209ZM16.5648 14.0471L16.9708 14.6741L18.2298 13.8591L17.8238 13.2321L16.5648 14.0471ZM15.4288 21.1841L15.3448 21.2691L16.4048 22.3301L16.4888 22.2471L15.4288 21.1841ZM16.9708 14.6741C17.3848 15.3141 17.6708 15.7571 17.8708 16.1241C18.0638 16.4821 18.1488 16.7211 18.1808 16.9391L19.6648 16.7191C19.5968 16.2621 19.4268 15.8491 19.1888 15.4091C18.9558 14.9791 18.6308 14.4791 18.2298 13.8591L16.9708 14.6741ZM16.4888 22.2471C17.0458 21.6911 17.6738 21.0641 18.1978 20.4941C18.4588 20.2091 18.7028 19.9281 18.9028 19.6711C19.0928 19.4261 19.2788 19.1561 19.3858 18.8991L18.0018 18.3221C17.9232 18.4757 17.8276 18.6199 17.7168 18.7521C17.5185 19.003 17.3104 19.2458 17.0928 19.4801C16.55 20.0596 15.9952 20.6277 15.4288 21.1841L16.4888 22.2471ZM18.1808 16.9391C18.2488 17.3951 18.1888 17.8731 18.0008 18.3221L19.3858 18.8991C19.6758 18.2107 19.7723 17.4583 19.6648 16.7191L18.1808 16.9391ZM13.5168 18.3951L12.9938 17.9361L12.0058 19.0641L12.5278 19.5221L13.5168 18.3951ZM15.4458 21.2971C15.2308 20.7581 15.1018 20.4321 14.9318 20.1231L13.6168 20.8431C13.7328 21.0531 13.8248 21.2811 14.0518 21.8531L15.4458 21.2971ZM12.4928 19.4901C12.9288 19.9241 13.1028 20.0991 13.2508 20.2881L14.4308 19.3621C14.2138 19.0851 13.9638 18.8371 13.5518 18.4271L12.4928 19.4901ZM14.9328 20.1221C14.7863 19.8555 14.6185 19.6014 14.4308 19.3621L13.2508 20.2881C13.3881 20.4628 13.5101 20.6478 13.6168 20.8431L14.9328 20.1221ZM16.6618 9.00009C16.4377 9.22304 16.1344 9.34819 15.8183 9.34819C15.5021 9.34819 15.1989 9.22304 14.9748 9.00009L13.9158 10.0621C14.4211 10.5656 15.1054 10.8484 15.8188 10.8484C16.5321 10.8484 17.2164 10.5656 17.7218 10.0621L16.6618 9.00009ZM14.9748 9.00009C14.864 8.89037 14.776 8.75977 14.716 8.61585C14.6559 8.47192 14.625 8.31753 14.625 8.16159C14.625 8.00565 14.6559 7.85125 14.716 7.70733C14.776 7.5634 14.864 7.43281 14.9748 7.32309L13.9158 6.26109C13.6654 6.51013 13.4668 6.80619 13.3312 7.13226C13.1956 7.45832 13.1258 7.80796 13.1258 8.16109C13.1258 8.51421 13.1956 8.86385 13.3312 9.18992C13.4668 9.51598 13.6654 9.81205 13.9158 10.0611L14.9748 9.00009ZM14.9748 7.32309C15.1989 7.09983 15.5024 6.97448 15.8188 6.97448C16.1351 6.97448 16.4386 7.09983 16.6628 7.32309L17.7218 6.26109C17.2164 5.75754 16.5321 5.4748 15.8188 5.4748C15.1054 5.4748 14.4211 5.75754 13.9158 6.26109L14.9748 7.32309ZM16.6628 7.32309C16.7736 7.43281 16.8615 7.5634 16.9216 7.70733C16.9816 7.85125 17.0125 8.00565 17.0125 8.16159C17.0125 8.31753 16.9816 8.47192 16.9216 8.61585C16.8615 8.75977 16.7726 8.89037 16.6618 9.00009L17.7218 10.0621C17.9721 9.81305 18.1708 9.51698 18.3063 9.19092C18.4419 8.86485 18.5117 8.51521 18.5117 8.16209C18.5117 7.80896 18.4419 7.45932 18.3063 7.13326C18.1708 6.80719 17.9721 6.51013 17.7218 6.26109L16.6628 7.32309ZM15.3438 21.2681C15.3522 21.2613 15.3616 21.2559 15.3718 21.2521L15.3948 21.2511L15.4188 21.2631C15.4308 21.2731 15.4394 21.2844 15.4448 21.2971L14.0508 21.8521C14.4348 22.8151 15.6828 23.0481 16.4028 22.3301L15.3438 21.2681ZM13.9168 15.8461C13.4058 16.3561 13.0198 16.7391 12.6888 17.0241C12.3578 17.3111 12.1338 17.4501 11.9588 17.5151L12.4768 18.9231C12.9048 18.7651 13.2908 18.4871 13.6698 18.1591C14.0488 17.8311 14.4778 17.4041 14.9748 16.9091L13.9168 15.8461ZM11.9588 17.5151C11.8759 17.5475 11.7887 17.5637 11.6998 17.5631V19.0631C11.9691 19.0624 12.2274 19.0158 12.4768 18.9231L11.9588 17.5151ZM13.0288 17.9701L12.7488 17.6891L11.6868 18.7491L11.9688 19.0301L13.0288 17.9701ZM7.04977 9.00009C6.56477 9.48409 6.14577 9.90109 5.81977 10.2721C5.49577 10.6421 5.21877 11.0171 5.05377 11.4281L6.44477 11.9881C6.51577 11.8111 6.66177 11.5881 6.94777 11.2611C7.23277 10.9361 7.61077 10.5591 8.10877 10.0611L7.04977 9.00009ZM5.05377 11.4281C4.94382 11.6948 4.88742 11.9806 4.88777 12.2691H6.38777C6.38777 12.1791 6.40377 12.0911 6.44477 11.9881L5.05377 11.4281ZM5.04277 12.0621L5.21877 12.2381L6.27877 11.1781L6.10477 11.0001L5.04277 12.0621Z" fill="url(#paint0_linear_692_1129)" />
                    <defs>
                      <linearGradient id="paint0_linear_692_1129" x1="2.54872" y1="-11.3784" x2="35.79" y2="5.3027" gradientUnits="userSpaceOnUse">
                        <stop offset="0.184" stopColor="#29ABE2" />
                        <stop offset="0.821" stopColor="#0171F9" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <span className="font-[Outfit] sm:text-2xl text-xl font-medium text-[#121212] leading-8">Mission</span>
                </div>
                <div className="px-6 sm:px-7 py-6 sm:py-8">
                  <p className="font-inter text-sm sm:text-base text-[#212121] text-center leading-[26px] opacity-[0.96]">
                    To empower substitute teachers with transparent, peer-sourced school insights that support informed, confident, and dignified professional decisions.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="rounded-[26px] bg-[#F8F9FD] overflow-hidden flex flex-col">
                <div className="flex items-center justify-center gap-3 px-6 sm:px-7 py-4 sm:py-5 bg-[rgba(1,113,249,0.06)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4.46005C9.97004 4.15186 10.9822 3.99667 12 4.00005C16.182 4.00005 19.028 6.50005 20.725 8.70405C21.575 9.81005 22 10.3611 22 12.0001C22 13.6401 21.575 14.1911 20.725 15.2961C19.028 17.5001 16.182 20.0001 12 20.0001C7.818 20.0001 4.972 17.5001 3.275 15.2961C2.425 14.1921 2 13.6391 2 12.0001C2 10.3601 2.425 9.80905 3.275 8.70405C3.7935 8.02688 4.37074 7.39677 5 6.82105" stroke="url(#vision_icon_g)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12Z" stroke="url(#vision_icon_g2)" strokeWidth="1.5" />
                    <defs>
                      <linearGradient id="vision_icon_g" x1="3.21" y1="-5.4" x2="30.99" y2="12.03" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                      <linearGradient id="vision_icon_g2" x1="9.36" y1="5.48" x2="18.64" y2="10.13" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                  <span className="font-[Outfit] sm:text-2xl text-xl font-medium text-[#121212] leading-8">Vision</span>
                </div>
                <div className="px-6 sm:px-7 py-6 sm:py-8">
                  <p className="font-inter text-sm sm:text-base text-[#212121] text-center leading-[26px] opacity-[0.96]">
                    A world where every guest teacher walks into every classroom fully prepared — and every school competes to be a place subs genuinely want to work.
                  </p>
                </div>
              </div>

              {/* Goal */}
              <div className="rounded-[26px] bg-[#F8F9FD] overflow-hidden flex flex-col">
                <div className="flex items-center justify-center gap-3 px-6 sm:px-7 py-4 sm:py-5 bg-[rgba(1,113,249,0.06)]">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 15.1668V2.3335L23.3333 7.00016L14 11.6668" stroke="url(#goal_icon_g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23.9875 11.9258C24.6083 13.8393 24.6664 15.8909 24.1548 17.8364C23.6432 19.782 22.5835 21.5397 21.1018 22.9003C19.62 24.2609 17.7786 25.1672 15.7966 25.5114C13.8145 25.8557 11.7754 25.6232 9.92161 24.8419C8.06787 24.0605 6.47761 22.763 5.34003 21.1039C4.20245 19.4447 3.56543 17.4937 3.50478 15.4829C3.44412 13.4721 3.96237 11.4862 4.99786 9.76152C6.03336 8.0368 7.54252 6.64585 9.34579 5.75415" stroke="url(#goal_icon_g2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.33546 11.6633C8.75085 12.4415 8.37026 13.3536 8.22835 14.3166C8.08644 15.2795 8.18773 16.2626 8.523 17.1764C8.85826 18.0901 9.41684 18.9055 10.1478 19.5481C10.8788 20.1907 11.759 20.6403 12.7082 20.8557C13.6574 21.0711 14.6454 21.0456 15.5822 20.7815C16.519 20.5174 17.3748 20.0231 18.0717 19.3436C18.7686 18.6641 19.2844 17.821 19.5721 16.8912C19.8597 15.9614 19.9102 14.9743 19.7188 14.02" stroke="url(#goal_icon_g3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="goal_icon_g1" x1="14.56" y1="-5.2" x2="30.5" y2="0.61" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                      <linearGradient id="goal_icon_g2" x1="4.77" y1="-5.94" x2="36.52" y2="10.86" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                      <linearGradient id="goal_icon_g3" x1="8.87" y1="6.18" x2="25.08" y2="16.34" gradientUnits="userSpaceOnUse"><stop offset="0.184" stopColor="#29ABE2" /><stop offset="0.821" stopColor="#0171F9" /></linearGradient>
                    </defs>
                  </svg>
                  <span className="font-[Outfit] sm:text-2xl text-xl font-medium text-[#121212] leading-8">Goal</span>
                </div>
                <div className="px-6 sm:px-7 py-6 sm:py-8">
                  <p className="font-inter text-sm sm:text-base text-[#212121] text-center leading-[26px] opacity-[0.96]">
                    To become the most trusted, comprehensive, and widely-used school review platform for substitute teachers across the United States and beyond.
                  </p>
                </div>
              </div>
            </div></div>
        </section>

      </main>
      <Footer />
    </>
  );
}
