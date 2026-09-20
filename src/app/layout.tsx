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
                try {
                  var _ce = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var a = arguments[i];
                      var str = (a && (a.message || a.stack || String(a))) || "";
                      if (str.indexOf("startTime") !== -1 || str.indexOf("reportAllChanges") !== -1) return;
                    }
                    _ce.apply(console, arguments);
                  };
                } catch (_) {}

                window.addEventListener("error", function(e) {
                  var msg = (e && (e.message || (e.error && (e.error.message || e.error.stack)))) || "";
                  if (msg.indexOf("startTime") !== -1 || msg.indexOf("reportAllChanges") !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener("unhandledrejection", function(e) {
                  var msg = (e && e.reason && (e.reason.message || e.reason.stack || String(e.reason))) || "";
                  if (msg.indexOf("startTime") !== -1 || msg.indexOf("reportAllChanges") !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);

                try {
                  if (typeof PerformanceObserverEntryList !== "undefined") {
                    var p = PerformanceObserverEntryList.prototype;
                    ["getEntries", "getEntriesByType", "getEntriesByName"].forEach(function(m) {
                      if (p[m]) {
                        var orig = p[m];
                        p[m] = function() {
                          var list = orig.apply(this, arguments);
                          return (list || []).filter(Boolean);
                        };
                      }
                    });
                  }
                } catch (_) {}
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
