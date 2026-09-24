"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onUploadSuccess: (urls: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  compact?: boolean; // Button mode vs Dropzone mode
  buttonText?: string;
  className?: string;
}

export function ImageUploader({
  onUploadSuccess,
  multiple = false,
  disabled = false,
  compact = false,
  buttonText = "Tải ảnh từ máy",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    // Validate client-side
    for (const file of fileList) {
      if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)$/i)) {
        toast.error(`"${file.name}" không phải là định dạng hình ảnh hợp lệ.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`"${file.name}" vượt quá giới hạn dung lượng 15MB.`);
        return;
      }
    }

    const formData = new FormData();
    if (multiple) {
      fileList.forEach((file) => formData.append("files", file));
    } else {
      formData.append("file", fileList[0]);
    }

    try {
      setIsUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Tải ảnh lên thất bại");
      }

      if (data.urls && data.urls.length > 0) {
        onUploadSuccess(data.urls);
        toast.success(
          data.urls.length > 1
            ? `Đã tải lên ${data.urls.length} hình ảnh vào máy chủ VPS!`
            : "Đã tải ảnh lên máy chủ VPS thành công!"
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi tải ảnh lên VPS.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  if (compact) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={disabled || isUploading}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5 border-[#D5D5D0] hover:border-[#111] hover:text-[#111] text-[11px] h-7.5 px-2.5 rounded-lg whitespace-nowrap bg-white font-medium shadow-none"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-cyan-600" />
              Đang lưu VPS...
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled || isUploading}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && !disabled && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          isDragOver
            ? "border-cyan-500 bg-cyan-50/50"
            : "border-[#D5D5D0] hover:border-[#111] bg-[#FAFAFA] hover:bg-white"
        } ${isUploading || disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2 text-[#74746E]">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            <p className="text-xs font-medium">Đang lưu ảnh trực tiếp vào máy chủ VPS...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1 text-center">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600 mb-0.5">
              <UploadCloud className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-[#111]">
              Kéo thả hình ảnh vào đây hoặc <span className="text-cyan-600 underline">bấm để chọn file từ máy</span>
            </p>
            <p className="text-[11px] text-[#A3A39D]">
              {multiple
                ? "Hỗ trợ chọn nhiều ảnh cùng lúc (JPG, PNG, WEBP, GIF, SVG - Tối đa 15MB/ảnh)"
                : "Hỗ trợ định dạng JPG, PNG, WEBP, GIF, SVG (Tối đa 15MB)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
