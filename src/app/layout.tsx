import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智能声乐正音助手",
  description: "法语艺术歌曲发音指导工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
