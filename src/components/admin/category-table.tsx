"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit3, Trash2, Layers, FolderKanban, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryModal, type CategoryModalData } from "@/components/admin/category-modal";
import { deleteCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  orderIndex: number;
  _count: {
    products: number;
  };
}

interface CategoryTableProps {
  categories: CategoryWithCount[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryModalData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat: CategoryWithCount) => {
    setSelectedCategory({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      orderIndex: cat.orderIndex,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: CategoryWithCount) => {
    if (cat._count.products > 0) {
      toast.error(
        `Không thể xóa: Danh mục "${cat.name}" đang có ${cat._count.products} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`
      );
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không? Thao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }

    setDeletingId(cat.id);
    startTransition(async () => {
      const res = await deleteCategory(cat.id);
      if (res.success) {
        toast.success(`Đã xóa danh mục "${cat.name}"`);
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa danh mục");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên danh mục, slug..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddNew} variant="neon" className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/90 border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Thứ tự</th>
                <th className="py-3.5 px-4">Ảnh / Icon</th>
                <th className="py-3.5 px-4">Tên danh mục</th>
                <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                <th className="py-3.5 px-4 text-center">Số sản phẩm</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <FolderKanban className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
                    <p className="text-sm font-medium">
                      {search ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục nào"}
                    </p>
                    {search && (
                      <p className="text-xs text-zinc-600 mt-1">
                        Thử tìm kiếm với từ khóa khác
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Thứ tự */}
                    <td className="py-4 px-4 text-center font-mono text-xs text-zinc-400 font-semibold">
                      #{cat.orderIndex}
                    </td>

                    {/* Ảnh / Icon */}
                    <td className="py-4 px-4">
                      <div className="w-11 h-11 rounded-lg bg-zinc-800/80 border border-zinc-700/60 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/40 transition-colors">
                        {cat.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                    </td>

                    {/* Tên & Mô tả */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5 max-w-md">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded bg-zinc-800 text-cyan-300/90 border border-zinc-700/50">
                        /{cat.slug}
                      </span>
                    </td>

                    {/* Số sản phẩm */}
                    <td className="py-4 px-4 text-center">
                      <Badge
                        variant={cat._count.products > 0 ? "secondary" : "outline"}
                        className={
                          cat._count.products > 0
                            ? "bg-cyan-950/40 text-cyan-400 border border-cyan-800/40"
                            : "text-zinc-500 border-zinc-800"
                        }
                      >
                        {cat._count.products} sản phẩm
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(cat)}
                          title="Chỉnh sửa danh mục"
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-950/30"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.id || cat._count.products > 0}
                          title={
                            cat._count.products > 0
                              ? "Không thể xóa danh mục đang có sản phẩm"
                              : "Xóa danh mục"
                          }
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
