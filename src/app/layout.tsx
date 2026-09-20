import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], display: "swap" });

export const metadata: Metadata = {
  title: "CaoTri Gaming Gear & Phụ Kiện Công Nghệ",
  description: "Cửa hàng chuyên cung cấp bàn phím cơ, chuột gaming, tai nghe và phụ kiện máy tính chính hãng chất lượng cao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://placehold.co" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined") {
                window.addEventListener("error", function(e) {
                  if (e && (
                    (e.message && e.message.indexOf("startTime") !== -1) ||
                    (e.error && e.error.stack && e.error.stack.indexOf("reportAllChanges") !== -1)
                  )) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener("unhandledrejection", function(e) {
                  if (e && e.reason && e.reason.message && e.reason.message.indexOf("startTime") !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
