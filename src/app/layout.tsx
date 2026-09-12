import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { FinancialChatbot } from "@/components/ai/FinancialChatbot";
import { ChatbotProvider } from "@/components/providers/ChatbotProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Mind Over Money", template: "%s | Mind Over Money" },
  description:
    "Educational decision-support that turns complex financial data into simple, personalized insights.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-background font-sans text-foreground antialiased`}
      >
        <AuthProvider>
          <ChatbotProvider>
            <AppShell>{children}</AppShell>
            <FinancialChatbot />
          </ChatbotProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
