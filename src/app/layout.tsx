import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextlevel.academy";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NextLevel Academy — Belajar, Naik Level, Bersertifikat",
    template: "%s · NextLevel Academy",
  },
  description:
    "Platform pembelajaran digital dengan gamifikasi dan sistem magang terintegrasi. Belajar dengan pace kamu, kumpulkan EXP, raih sertifikat.",
  applicationName: "NextLevel Academy",
  authors: [{ name: "NextLevel Academy" }],
  creator: "NextLevel Academy",
  publisher: "NextLevel Academy",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: "/NextLevel_LogoFit.webp", type: "image/webp" },
    ],
    shortcut: "/NextLevel_LogoFit.webp",
    apple: "/NextLevel_LogoFit.webp",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1530" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
