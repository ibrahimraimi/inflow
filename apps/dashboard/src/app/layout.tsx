import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";

import "@inflow/ui/globals.css";
import { Toaster } from "@inflow/ui";
import siteConfig from "@inflow/core/configs/site";
import { SWRProvider } from "@/components/swr-provider";
import { ThemeProvider } from "@/components/theme-provider";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `Dashboard | ${siteConfig.name}`,
    template: "%s | Inflow Dashboard",
  },
  description: `${siteConfig.description}`,
  keywords: [],
  authors: [{ name: "Inflow" }],
  creator: "Inflow",
  publisher: "Inflow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://inflowcloud.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name}`,
    description: `${siteConfig.description}`,
    url: `${siteConfig.domain}`,
    siteName: `${siteConfig.name}`,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Screenshot of the analytics page next to a column of text featuring the Inflow logo and a caption that reads &quot;Your friendly, modern alternative to Google Analytics: Simple, Privacy-friendly",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title}`,
    description: `${siteConfig.description}`,
    images: ["/opengraph-image.png"],
    creator: "@inflow",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SWRProvider>
            <main className="flex-1 text-foreground">
              {children}
            </main>
            <Toaster />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
