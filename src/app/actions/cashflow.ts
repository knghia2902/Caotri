"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getVnDateKey, isValidDateKey, vnStartOfDay } from "@/lib/date-vn";
import {
  cashflowEntrySchema,
  updateCashflowEntrySchema,
  type CashflowEntryInput,
  type UpdateCashflowEntryInput,
} from "@/lib/finance-schema";

export type { CashflowEntryInput, UpdateCashflowEntryInput };

export interface CashflowActionResult {
  success: boolean;
  entryId?: string;
  message?: string;
  error?: string;
}

function parseOccurredAt(raw?: string | null): Date {
  if (!raw || !raw.trim()) return new Date();
  const trimmed = raw.trim();

  if (isValidDateKey(trimmed)) {
    const start = vnStartOfDay(trimmed);
    return new Date(start.getTime() + 12 * 60 * 60 * 1000);
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}+07:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Tạo phiếu Thu / Chi thủ công trong sổ quỹ — CHỈ DÀNH CHO ADMIN
 */
export async function createCashflowEntryAction(
  input: CashflowEntryInput
): Promise<CashflowActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    const validated = cashflowEntrySchema.parse(input);

    const occurredAt = parseOccurredAt(validated.occurredAt);
    const dateKey = getVnDateKey(occurredAt);

    const created = await prisma.cashflowEntry.create({
      data: {
        type: validated.type,
        category: validated.category,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        occurredAt,
        dateKey,
        note: validated.note?.trim() || null,
        createdById: session.userId,
      },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");

    return {
      success: true,
      entryId: created.id,
      message:
        validated.type === "IN"
          ? "Đã ghi nhận phiếu thu thành công"
          : "Đã ghi nhận phiếu chi thành công",
    };
  } catch (err: unknown) {
    console.error("Lỗi khi tạo phiếu thu/chi:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi tạo phiếu thu/chi!",
    };
  }
}

/**
 * Cập nhật phiếu Thu / Chi thủ công — CHỈ DÀNH CHO ADMIN.
 * Chặn sửa phiếu tự động gắn với đơn hàng (orderId !== null).
 */
export async function updateCashflowEntryAction(
  input: UpdateCashflowEntryInput
): Promise<CashflowActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const validated = updateCashflowEntrySchema.parse(input);

    const existing = await prisma.cashflowEntry.findUnique({
      where: { id: validated.id },
      select: { id: true, orderId: true },
    });

    if (!existing) {
      return { success: false, error: "Phiếu thu/chi không tồn tại" };
    }

    if (existing.orderId !== null) {
      return {
        success: false,
        error:
          "Không thể chỉnh sửa phiếu thu/chi tự động gắn với đơn hàng. Vui lòng thao tác trực tiếp trên đơn hàng tương ứng!",
      };
    }

    const occurredAt = parseOccurredAt(validated.occurredAt);
    const dateKey = getVnDateKey(occurredAt);

    await prisma.cashflowEntry.update({
      where: { id: validated.id },
      data: {
        type: validated.type,
        category: validated.category,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        occurredAt,
        dateKey,
        note: validated.note?.trim() || null,
      },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");

    return {
      success: true,
      entryId: validated.id,
      message: "Đã cập nhật phiếu thu/chi thành công",
    };
  } catch (err: unknown) {
    console.error("Lỗi khi cập nhật phiếu thu/chi:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi cập nhật phiếu thu/chi!",
    };
  }
}

/**
 * Xóa phiếu Thu / Chi thủ công — CHỈ DÀNH CHO ADMIN.
 * Chặn xóa phiếu tự động gắn với đơn hàng (orderId !== null).
 */
export async function deleteCashflowEntryAction(
  entryId: string
): Promise<CashflowActionResult> {
  try {
    await requireRole(["ADMIN"]);

    if (!entryId || !entryId.trim()) {
      return { success: false, error: "Thiếu mã phiếu thu/chi cần xóa" };
    }

    const existing = await prisma.cashflowEntry.findUnique({
      where: { id: entryId },
      select: { id: true, orderId: true },
    });

    if (!existing) {
      return { success: false, error: "Phiếu thu/chi không tồn tại" };
    }

    if (existing.orderId !== null) {
      return {
        success: false,
        error:
          "Không thể xóa phiếu thu/chi tự động gắn với đơn hàng. Vui lòng thay đổi trạng thái đơn hàng tương ứng!",
      };
    }

    await prisma.cashflowEntry.delete({
      where: { id: entryId },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");

    return {
      success: true,
      entryId,
      message: "Đã xóa phiếu thu/chi thành công",
    };
  } catch (err: unknown) {
    console.error("Lỗi khi xóa phiếu thu/chi:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi xóa phiếu thu/chi!",
    };
  }
}
