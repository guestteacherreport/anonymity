"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageLoader from "@/app/components/PageLoader";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    const redirectTo = (path: string) => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      router.replace(path);
    };

    if (status === "unauthenticated") {
      redirectTo("/login");
      return;
    }

    const role = session?.user?.role;

    if (role === "admin") {
      redirectTo("/admin/dashboard");
      return;
    }

    redirectTo("/my-reports");
  }, [status, session, router]);

  return <PageLoader message="Redirecting..." />;
}
