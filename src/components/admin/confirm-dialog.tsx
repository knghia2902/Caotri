"use client";

import React, { useEffect } from "react";
import { Loader2, X } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.ReactNode {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-[10px] border border-[#E7E7E3] bg-white p-6 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-[#111111]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (!loading) onCancel();
            }}
            disabled={loading}
            aria-label="Đóng"
            className="rounded-md p-1 text-[#74746E] transition-colors hover:bg-[#F3F3F0] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {description && (
          <p
            id="confirm-dialog-description"
            className="mt-2 text-sm leading-relaxed text-[#555550]"
          >
            {description}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#E7E7E3] bg-white px-4 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F7F7F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isDanger
                ? "bg-[#D94A4A] hover:bg-[#C23E3E]"
                : "bg-[#111111] hover:bg-[#2A2A2A]"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
