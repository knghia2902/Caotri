"use client";

import { Phone, MessageSquare } from "lucide-react";

interface QuickContactDockProps {
  hotline?: string;
  zalo?: string;
  facebook?: string;
}

export function QuickContactDock({
  hotline = "0987.654.321",
  zalo = "https://zalo.me/0987654321",
  facebook = "https://facebook.com",
}: QuickContactDockProps) {
  // Chuẩn hóa số hotline cho link tel:
  const cleanPhone = hotline.replace(/[^0-9]/g, "");
  const telLink = cleanPhone ? `tel:${cleanPhone}` : `tel:0987654321`;

  // Chuẩn hóa Zalo link: nếu người dùng nhập số điện thoại thay vì link full
  let zaloLink = zalo;
  if (!zaloLink.startsWith("http")) {
    const cleanZalo = zaloLink.replace(/[^0-9]/g, "");
    zaloLink = `https://zalo.me/${cleanZalo}`;
  }

  return (
    <aside aria-label="Kênh liên hệ nhanh" className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3.5 select-none">
      {/* 1. Nút Chat Zalo */}
      <div className="relative group flex items-center">
        {/* Tooltip bên trái */}
        <div className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-700 text-xs font-medium text-zinc-100 whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Chat Zalo tư vấn 1-1
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-t border-r border-zinc-700 rotate-45" />
        </div>

        {/* Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping opacity-75 duration-1000" />

        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo tư vấn"
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-200 border border-blue-400/40"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
        </a>
      </div>

      {/* 2. Nút Facebook Messenger */}
      <div className="relative group flex items-center">
        {/* Tooltip bên trái */}
        <div className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-700 text-xs font-medium text-zinc-100 whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Nhắn tin Messenger Fanpage
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-t border-r border-zinc-700 rotate-45" />
        </div>

        {/* Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-indigo-500/25 animate-ping opacity-60 duration-1000 delay-300" />

        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nhắn tin Facebook Messenger"
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all duration-200 border border-indigo-400/30"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.455 5.518 3.735 7.151V22l3.447-1.892c.896.248 1.844.382 2.818.382 5.523 0 10-4.145 10-9.232C22 6.145 17.523 2 12 2zm1.002 12.441l-2.564-2.735-5.006 2.735 5.508-5.845 2.628 2.735 4.942-2.735-5.508 5.845z" />
          </svg>
        </a>
      </div>

      {/* 3. Nút Gọi Hotline */}
      <div className="relative group flex items-center">
        {/* Tooltip bên trái */}
        <div className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-700 text-xs font-medium text-zinc-100 whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Gọi ngay {hotline}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-t border-r border-zinc-700 rotate-45" />
        </div>

        {/* Pulse ring neon cyan */}
        <span className="absolute -inset-1 rounded-full bg-cyan-500/30 animate-ping opacity-75 duration-1000 delay-500" />

        <a
          href={telLink}
          aria-label={`Gọi hotline ${hotline}`}
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all duration-200 border border-cyan-300/50"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>
      </div>
    </aside>
  );
}
