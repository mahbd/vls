import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Vulnerability Showcase Portal",
  description: "Interactive educational tool for learning about SQL Injection and XSS vulnerabilities in a controlled environment",
  keywords: "security, SQL injection, XSS, web vulnerabilities, cybersecurity, education",
  authors: [{ name: "VLS Team" }],
  robots: "noindex, nofollow", // Prevent search engine indexing for security demo site
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
