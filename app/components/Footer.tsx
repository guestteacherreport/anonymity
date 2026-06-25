"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const { data: session } = useSession();
 
  return (
    <footer className="bg-[#FAFCFE] border-t border-[rgba(226,232,240,0.64)]">
      <div className="px-6 sm:px-[120px] flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full py-12">
          <Link href="/" aria-label="Anonymity" className="flex items-center flex-shrink-0">
            <Image src="/logo.svg" height={150} width={150} alt="Logo"/>
          </Link>
          <nav className="flex flex-col sm:flex-row items-start justify-end md:gap-8 gap-2 flex-wrap text-center">
            <div className="w-44">
              <Link href="/" className="font-[Outfit] text-base font-normal text-[#121212] hover:text-blue-600 transition-colors">Home</Link>
            </div>
            <div className="w-44 ">
              <Link href="/about" className="font-[Outfit] text-base font-normal text-[#121212] hover:text-blue-600 transition-colors">About Us</Link>
            </div>
            <div className="w-44 ">
              <Link href="/submit-report" className="font-[Outfit] text-base font-normal text-[#121212] hover:text-blue-600 transition-colors">Submit Report</Link>
            </div>
            <div className="w-44">
              <Link href="/browse-school" className="font-[Outfit] text-base font-normal text-[#121212] hover:text-blue-600 transition-colors">Browse School</Link>
            </div>
            <div className="w-44">
              {!session?
              <Link href="/login" className="font-[Outfit] text-base font-normal text-[#121212] hover:text-blue-600 transition-colors">Login/Signup</Link>
              :
              <button onClick={() => signOut()} className="cursor-pointer font-[Outfit] text-base font-normal text-[#121212] hover:text-blue-600 transition-colors">Logout</button>
              }
            </div>
          </nav>
        </div>
        <div className="border-t border-[#E2E8F0] pt-5 flex justify-center pb-5">
          <p className="font-inter text-[12px] font-light text-[#64748B] leading-[15px] tracking-[1px]">
            &copy; 2026 Anonymity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
