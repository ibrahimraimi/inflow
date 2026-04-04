import type { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { LogoMarkDark, LogoMarkLight } from "@/components/logo";
import { Button } from "@inflow/ui";

export const metadata: Metadata = {
  title: "Shared Analytics",
  description: "View shared analytics for this website.",
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <LogoMarkDark className="h-8 w-8 dark:hidden" />
              <LogoMarkLight className="h-8 w-8 hidden dark:block" />
              <span className="font-bold text-xl">Inflow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
                <Button variant="outline" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">
                <Button className="cursor-pointer">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/20">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Inflow. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm font-medium text-muted-foreground">
            <Link href="https://github.com/ibrahimraimi/inflow" className="hover:underline underline-offset-4">
              GitHub
            </Link>
            <Link href="/privacy" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline underline-offset-4">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
