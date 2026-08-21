import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "樂齡伴伴｜銀髮健康管家", description: "協助銀髮族管理用藥、健康紀錄與每日運動的貼心健康 App。" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body>{children}</body></html>; }
