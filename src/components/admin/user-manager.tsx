"use client";

import { useState, useTransition } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  UserCog,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Mail,
  User,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserItem,
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/app/actions/user";
import { UserRole } from "@/types";

interface UserManagerProps {
  initialUsers: UserItem[];
  currentUserId: string;
}

export function UserManager({ initialUsers, currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF">("ALL");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN" as UserRole,
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "ADMIN" as UserRole,
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalStaff = users.filter((u) => u.role === "STAFF").length;

  // 1. Xử lý Tạo tài khoản
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      toast.error("Vui lòng nhập họ và tên.");
      return;
    }

    if (!createForm.email.trim() || !createForm.email.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (createForm.password.length < 6) {
      toast.error("Mật khẩu phải có tối thiểu 6 ký tự.");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsCreating(true);
    try {
      const res = await createUserAction({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      });

      if (res.success) {
        toast.success(res.message || "Tạo tài khoản thành công!");
        setIsCreateOpen(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "ADMIN",
        });

        // Cập nhật danh sách client
        startTransition(() => {
          const newUser: UserItem = {
            id: `temp-${Date.now()}`,
            name: createForm.name,
            email: createForm.email.toLowerCase(),
            role: createForm.role,
            createdAt: new Date().toISOString(),
          };
          setUsers((prev) => [newUser, ...prev]);
        });
      } else {
        toast.error(res.error || "Không thể tạo tài khoản.");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tạo tài khoản.");
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Mở Modal Chỉnh sửa
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowEditPassword(false);
  };

  // 3. Xử lý Cập nhật tài khoản
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.name.trim()) {
      toast.error("Vui lòng nhập họ và tên.");
      return;
    }

    if (!editForm.email.trim() || !editForm.email.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ.");
      return;
    }

    if (editForm.newPassword) {
      if (editForm.newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự.");
        return;
      }
      if (editForm.newPassword !== editForm.confirmNewPassword) {
        toast.error("Mật khẩu xác nhận không khớp!");
        return;
      }
    }

    setIsUpdating(true);
    try {
      const res = await updateUserAction({
        id: editingUser.id,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        newPassword: editForm.newPassword || undefined,
      });

      if (res.success) {
        toast.success(res.message || "Đã cập nhật tài khoản!");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name: editForm.name,
                  email: editForm.email.toLowerCase(),
                  role: editForm.role,
                }
              : u
          )
        );
        setEditingUser(null);
      } else {
        toast.error(res.error || "Không thể cập nhật tài khoản.");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật tài khoản.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Xóa tài khoản
  const handleDeleteUser = async (user: UserItem) => {
    if (user.id === currentUserId) {
      toast.error("Không thể tự xóa tài khoản bạn đang đăng nhập!");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email}) không? Hành động này không thể hoàn tác!`)) {
      return;
    }

    setDeletingId(user.id);
    try {
      const res = await deleteUserAction(user.id);
      if (res.success) {
        toast.success(res.message || "Đã xóa tài khoản thành công!");
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        toast.error(res.error || "Không thể xóa tài khoản.");
      }
    } catch {
      toast.error("Lỗi khi xóa tài khoản.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. THẺ THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">Tổng tài khoản</p>
            <p className="text-2xl font-bold text-[#111] mt-1">{users.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#111]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">Quản trị viên (ADMIN)</p>
            <p className="text-2xl font-bold text-[#111] mt-1">{totalAdmins}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">Nhân viên (STAFF)</p>
            <p className="text-2xl font-bold text-[#111] mt-1">{totalStaff}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <UserCog className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ: TÌM KIẾM, BỘ LỌC & NÚT TẠO MỚI */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#74746E] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc email tài khoản..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl border-[#E7E7E3] bg-[#FAFAF8] text-sm focus:border-[#111]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F3] rounded-xl border border-[#E7E7E3] self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                roleFilter === "ALL"
                  ? "bg-white text-[#111] shadow-2xs"
                  : "text-[#74746E] hover:text-[#111]"
              }`}
            >
              Tất cả ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("ADMIN")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                roleFilter === "ADMIN"
                  ? "bg-white text-purple-700 font-semibold shadow-2xs"
                  : "text-[#74746E] hover:text-[#111]"
              }`}
            >
              Admin ({totalAdmins})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("STAFF")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                roleFilter === "STAFF"
                  ? "bg-white text-blue-700 font-semibold shadow-2xs"
                  : "text-[#74746E] hover:text-[#111]"
              }`}
            >
              Nhân viên ({totalStaff})
            </button>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-4 bg-[#111] hover:bg-[#222] text-white rounded-xl font-medium text-xs shadow-xs flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Tạo tài khoản quản trị
        </Button>
      </div>

      {/* 3. BẢNG DANH SÁCH TÀI KHOẢN */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#E7E7E3] text-[#74746E]">
                <th className="py-3.5 px-4 font-semibold">Tài khoản & Email</th>
                <th className="py-3.5 px-4 font-semibold">Vai trò / Phân quyền</th>
                <th className="py-3.5 px-4 font-semibold">Ngày tham gia</th>
                <th className="py-3.5 px-4 font-semibold">Trạng thái</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7E3]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#74746E]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-[#111]">Không tìm thấy tài khoản nào</p>
                      <p className="text-[11px]">
                        Thử tìm kiếm với từ khóa khác hoặc bấm nút Tạo tài khoản mới.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const isAdmin = user.role === "ADMIN";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FAFAF8]/80 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                              isAdmin
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {user.name.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#111] text-xs">
                                {user.name}
                              </span>
                              {isCurrentUser && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Bạn (Đang đăng nhập)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#74746E] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#999]" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            Quản trị viên (ADMIN)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCog className="w-3.5 h-3.5 text-blue-600" />
                            Nhân viên (STAFF)
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#74746E]">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#E7E7E3] hover:border-[#111]/40 text-[#111] hover:bg-white text-xs font-medium transition-all"
                            title="Chỉnh sửa thông tin / Đổi mật khẩu"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isCurrentUser || deletingId === user.id}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                              isCurrentUser
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : "border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                            title={
                              isCurrentUser
                                ? "Không thể tự xóa tài khoản của bạn"
                                : "Xóa tài khoản này"
                            }
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL TẠO TÀI KHOẢN MỚI */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7E3] max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111]">Tạo tài khoản quản trị mới</h3>
                  <p className="text-[11px] text-[#74746E]">
                    Cấp quyền quản trị viên hoặc nhân viên phụ trách cửa hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#74746E] hover:text-[#111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">
                  Họ và tên hiển thị <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A (Admin 2)"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">
                  Email đăng nhập <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="admin2@tringuyengear.vn"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Vai trò */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">
                  Phân quyền vai trò <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      createForm.role === "ADMIN"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-[#E7E7E3] hover:border-[#111]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="create_role"
                      value="ADMIN"
                      checked={createForm.role === "ADMIN"}
                      onChange={() =>
                        setCreateForm({ ...createForm, role: "ADMIN" })
                      }
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-bold text-[#111]">Quản trị viên</p>
                      <p className="text-[10px] text-[#74746E] mt-0.5">
                        Toàn quyền (sản phẩm, đơn hàng, cài đặt, backup, nhân sự)
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      createForm.role === "STAFF"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-[#E7E7E3] hover:border-[#111]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="create_role"
                      value="STAFF"
                      checked={createForm.role === "STAFF"}
                      onChange={() =>
                        setCreateForm({ ...createForm, role: "STAFF" })
                      }
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-[#111]">Nhân viên</p>
                      <p className="text-[10px] text-[#74746E] mt-0.5">
                        Xử lý đơn hàng, quản lý sản phẩm và danh mục
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Mật khẩu khởi tạo */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">
                  Mật khẩu khởi tạo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showCreatePassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    className="h-10 pr-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111]"
                  >
                    {showCreatePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nhập lại mật khẩu */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">
                  Xác nhận lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <Input
                  type={showCreatePassword ? "text" : "password"}
                  required
                  placeholder="Nhập lại mật khẩu ở trên"
                  value={createForm.confirmPassword}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E7E3]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="h-9 text-xs bg-[#111] hover:bg-[#222] text-white rounded-xl"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo tài khoản"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL CHỈNH SỬA / ĐỔI MẬT KHẨU TÀI KHOẢN */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7E3] max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111]">Chỉnh sửa tài khoản</h3>
                  <p className="text-[11px] text-[#74746E]">
                    Cập nhật họ tên, vai trò hoặc thiết lập lại mật khẩu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-[#74746E] hover:text-[#111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">Họ và tên</label>
                <Input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">Email</label>
                <Input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Vai trò */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">Vai trò</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      editForm.role === "ADMIN"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-[#E7E7E3] hover:border-[#111]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_role"
                      value="ADMIN"
                      checked={editForm.role === "ADMIN"}
                      onChange={() =>
                        setEditForm({ ...editForm, role: "ADMIN" })
                      }
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-bold text-[#111]">Quản trị viên</p>
                      <p className="text-[10px] text-[#74746E] mt-0.5">Toàn quyền</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      editForm.role === "STAFF"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-[#E7E7E3] hover:border-[#111]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="edit_role"
                      value="STAFF"
                      checked={editForm.role === "STAFF"}
                      onChange={() =>
                        setEditForm({ ...editForm, role: "STAFF" })
                      }
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-[#111]">Nhân viên</p>
                      <p className="text-[10px] text-[#74746E] mt-0.5">Giới hạn quyền</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Đổi mật khẩu mới (Tùy chọn) */}
              <div className="pt-2 border-t border-[#E7E7E3] space-y-3">
                <div>
                  <p className="font-semibold text-[#111] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    Đặt lại mật khẩu mới
                  </p>
                  <p className="text-[11px] text-[#74746E]">
                    Bỏ trống phần này nếu không có nhu cầu đổi mật khẩu cho tài khoản.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#111]">Mật khẩu mới</label>
                  <div className="relative">
                    <Input
                      type={showEditPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      value={editForm.newPassword}
                      onChange={(e) =>
                        setEditForm({ ...editForm, newPassword: e.target.value })
                      }
                      className="h-10 pr-10 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111]"
                    >
                      {showEditPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {editForm.newPassword && (
                  <div className="space-y-1.5">
                    <label className="block text-[#111]">Xác nhận mật khẩu mới</label>
                    <Input
                      type={showEditPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={editForm.confirmNewPassword}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          confirmNewPassword: e.target.value,
                        })
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E7E3]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="h-9 text-xs rounded-xl"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-9 text-xs bg-[#111] hover:bg-[#222] text-white rounded-xl"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
