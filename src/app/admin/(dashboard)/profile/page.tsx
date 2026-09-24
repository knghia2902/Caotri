import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { ChangePasswordCard } from "@/components/admin/change-password-card";
import { User, Shield, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const displayName =
    session.name === "Quản trị viên CaoTri" || session.name === "Quản trị viên TringuyenGear" ? "Admin" : session.name || "Admin";

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
          <User className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tài khoản Quản trị
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Hồ sơ cá nhân & Bảo mật
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Quản lý thông tin tài khoản và cập nhật mật khẩu quản trị viên
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E7E7E3]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#111] text-white flex items-center justify-center shadow-sm shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#111]">
                {displayName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#111] text-white px-2.5 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                Quản trị viên
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#74746E] mt-1">
              <Mail className="w-4 h-4" />
              <span>{session.email}</span>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordCard userEmail={session.email} />
    </div>
  );
}
