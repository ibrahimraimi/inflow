import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";

import "@/styles/globals.css";
import siteConfig from "@/configs/site";
import { Toaster } from "@/components/ui/sonner";
import { SWRProvider } from "@/components/swr-provider";
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
  keywords: [],
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
          data-website-id="cacce3e3-e255-4b87-a267-08eb8bc2ad08"
          data-domain="http://localhost:3000"
          src="http://localhost:3000/analytics.js"
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
          <SWRProvider>
            <SiteHeader />
            <main className="flex-1">
              <RootProvider>{children}</RootProvider>
            </main>
            <SiteFooter />
            <Toaster />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
