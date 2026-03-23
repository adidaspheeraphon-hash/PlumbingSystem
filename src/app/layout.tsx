import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Shell from "@/components/layout/Shell";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "ระบบจัดการประปาหมู่บ้าน",
  description: "ระบบบริหารจัดการประปาหมู่บ้าน บันทึกมิเตอร์ ออกใบแจ้งหนี้ และใบเสร็จรับเงิน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-prompt antialiased`} suppressHydrationWarning>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
