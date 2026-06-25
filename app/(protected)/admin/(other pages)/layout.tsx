"use client";

import Sidebar from "@/app/components/Sidebar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
     <div className="flex h-screen bg-[#F3F4F7]">

      {/* Sidebar - Hidden on mobile, visible on lg screens */}
      <div className="hidden lg:block lg:w-72 lg:flex-shrink-0">
        <Sidebar/>
      </div>

      {/* Mobile sidebar overlay - starts below header */}
      {sidebarOpen && (
        <div
          className="fixed left-0 right-0 top-16 sm:top-20 bottom-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar - starts below header */}
      <div className={`fixed left-0 top-[92] sm:top-20 bottom-0 w-72 z-40 lg:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar/>
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden [&_main]:outline-none [&_main]:focus:outline-none">

        {/* Top header bar */}
        <header className="z-40 relative h-[92px] bg-white border-b border-black/10 flex items-center px-4 sm:px-6 lg:px-8 flex-shrink-0">
          {/* Logo - Left side */}
          <div className="flex-shrink-0 sm:hidden">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" height={150} width={150} alt="Logo" className="w-auto" />
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-inter font-semibold text-xs sm:text-sm text-[#191C1E] leading-5">{session?.user?.name}</span>
              <span className="font-inter font-normal text-[10px] sm:text-[11px] text-[#737786] leading-[16.5px] tracking-[0.55px] uppercase">Super Admin</span>
            </div>
            <div className="relative w-8 sm:w-10 h-8 sm:h-10 sm:block hidden">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-[10px] bg-[#EDF5FF]" />
              <span className="absolute inset-0 flex items-center justify-center font-outfit font-medium text-sm sm:text-lg text-[#0171F9]">M</span>
            </div>
          </div>

          {/* Toggle button - Shows menu icon when closed, close icon when open */}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden flex flex-col gap-1.5 p-2 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0171F9]/40 rounded-md"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <div className={`w-6 h-0.5 bg-[#121212] transition-all duration-300 ${sidebarOpen ? "rotate-45 translate-y-2" : ""}`}></div>
            <div className={`w-6 h-0.5 bg-[#121212] transition-all duration-300 ${sidebarOpen ? "opacity-0" : ""}`}></div>
            <div className={`w-6 h-0.5 bg-[#121212] transition-all duration-300 ${sidebarOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
          </button>
          {/* <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors ml-2"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#191C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="#191C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button> */}
        </header>

      {/* Main content */}
    {children}
     </div>
    </div>
  );
}
