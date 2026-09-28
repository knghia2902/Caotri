import { Toaster } from "sonner";
import { Suspense } from "react";
import { ToastHandler } from "@/components/admin/toast-handler";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111]">
      <Suspense>
        <ToastHandler />
      </Suspense>
      <Toaster position="top-right" theme="light" richColors closeButton />
      {children}
    </div>
  );
}
