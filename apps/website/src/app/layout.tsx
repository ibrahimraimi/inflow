import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";

import "@inflow/ui/globals.css";
import { Toaster } from "@inflow/ui";
import siteConfig from "@inflow/core/configs/site";
import { SiteFooter, SiteHeader } from "@/components/site";
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
    default: `${siteConfig.name}`,
    template: "%s | Inflow",
  },
  description: `${siteConfig.description}`,
  keywords: [
    "analytics",
    "privacy-friendly",
    "open source",
    "self-hosted",
    "user behavior",
    "funnels",
    "session replay",
  ],
  authors: [{ name: "Inflow" }],
  creator: "Inflow",
  publisher: "Inflow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://inflow.ibrahimraimi.com"),
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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
      <head>
        <script
          defer
          data-website-id="1c10e3af-ff81-4650-8fd6-4a795a9daf7a"
          data-domain="http://localhost:3000"
          src="http://localhost:3002/analytics.js"
        ></script>
      </head>
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
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
