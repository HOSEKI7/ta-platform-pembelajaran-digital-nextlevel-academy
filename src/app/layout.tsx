import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import Script from "next/script";

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

/**
 * Anti-FOUC theme script. Runs before paint to set the `dark` class on <html>
 * from the saved preference (or the OS setting for "system"), matching the
 * logic in `ThemeProvider`. Injected via `next/script` with `beforeInteractive`
 * so Next emits it into the initial HTML head outside React's element tree —
 * which is what avoids React 19.2's "Encountered a script tag…" warning that a
 * raw `<script>` rendered by a component triggers on client re-render.
 */
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='light'||s==='dark'||s==='system')?s:'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

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
      { url: "/NextLevel_Mini_Logo.webp", type: "image/webp" },
    ],
    shortcut: "/NextLevel_Mini_Logo.webp",
    apple: "/NextLevel_Mini_Logo.webp",
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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {/* QueryProvider sits above ThemeProvider so a ThemeProvider remount
            (e.g. Fast Refresh) can never strip the QueryClient from descendants
            like the topbar's notifications bell. */}
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
