import { Toaster } from "sonner";
import { Suspense } from "react";
import { ToastHandler } from "@/components/admin/toast-handler";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Suspense>
        <ToastHandler />
      </Suspense>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      {children}
    </div>
  );
}
