import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConvexClientProvider from "@/components/ConvexClientProvider";


export const metadata: Metadata = {
  title: "Split — Institutional Payment Routing",
  description:
    "Route every payment where it belongs. Automated fee distribution for institutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html
        lang="en"
        className={`h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-app">
          <ConvexClientProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </ConvexClientProvider>
          <footer className="border-t border-border-subtle py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm text-muted">
                Split — Institutional Payment Routing Platform
              </p>
              <p className="text-xs mt-1 text-muted-dark">
                Route Every Payment Where It Belongs.
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
