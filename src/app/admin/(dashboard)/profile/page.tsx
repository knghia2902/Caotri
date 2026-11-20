import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { ChangePasswordCard } from "@/components/admin/change-password-card";
import { User, Shield, Mail, UserPlus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const displayName =
    session.name === "Quản trị viên CaoTri" || session.name === "Quản trị viên TringuyenGear" ? "Admin" : session.name || "Admin";

  const isAdmin = session.role === "ADMIN";
  const roleLabel = isAdmin ? "Quản trị viên" : "Nhân viên";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
          Hồ sơ cá nhân &amp; Bảo mật
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Quản lý thông tin tài khoản và cập nhật mật khẩu đăng nhập
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-[10px] bg-white border border-[#E7E7E3]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#111111]">
                {displayName}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isAdmin
                    ? "bg-[#111111] text-white"
                    : "bg-[#F3F3F0] text-[#555550] border border-[#E7E7E3]"
                }`}
              >
                <Shield className="w-3 h-3" />
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#74746E] mt-1">
              <Mail className="w-4 h-4" />
              <span>{session.email}</span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F7F7F5] hover:bg-[#EFEFED] border border-[#E7E7E3] rounded-[10px] text-xs font-semibold text-[#111111] transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#555550]" />
            <span>Quản lý tài khoản &amp; phân quyền</span>
            <ChevronRight className="w-4 h-4 text-[#74746E]" />
          </Link>
        )}
      </div>

      <ChangePasswordCard userEmail={session.email} />
    </div>
  );
}
