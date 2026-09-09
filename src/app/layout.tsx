import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
