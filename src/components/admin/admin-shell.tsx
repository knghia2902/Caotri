"use client";

import { useState } from "react";
import { SessionPayload } from "@/types";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";

interface AdminShellProps {
  session: SessionPayload;
  children: React.ReactNode;
}

export function AdminShell({ session, children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F7F7F5] text-[#111111] print:bg-white print:block">
      {/* Sidebar navigation */}
      <AdminSidebar
        userRole={session.role}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <AdminHeader
          session={session}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
