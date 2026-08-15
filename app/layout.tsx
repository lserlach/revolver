import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-ui",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Револьвер",
  description: "Мини-приложение револьвера для Liars Bar",
  applicationName: "Револьвер",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Револьвер",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={interTight.variable}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
