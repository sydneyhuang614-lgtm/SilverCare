import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "暖日 WarmDay｜貼心健康陪伴", description: "每天多一點健康，多一點安心。協助長輩與家人管理健康紀錄、提醒與每日運動。" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body>{children}</body></html>; }
