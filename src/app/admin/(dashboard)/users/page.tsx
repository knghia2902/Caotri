import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getUsersAction } from "@/app/actions/user";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản lý Tài khoản & Phân quyền | Admin TringuyenGear",
  description: "Tạo tài khoản quản trị viên, nhân viên bán hàng và phân quyền bảo mật",
};

export default async function AdminUsersPage() {
  const session = await getCurrentSession();

  // Chỉ ADMIN mới có quyền truy cập trang quản lý tài khoản
  if (!session || session.role !== "ADMIN") {
    redirect("/admin?error=forbidden");
  }

  const users = await getUsersAction();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Tài khoản quản trị & Nhân sự
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Tạo tài khoản Quản trị viên mới, thêm nhân viên bán hàng và phân quyền truy cập hệ thống
        </p>
      </div>

      {/* Main User Manager Component */}
      <UserManager initialUsers={users} currentUserId={session.userId} />
    </div>
  );
}
