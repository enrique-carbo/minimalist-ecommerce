import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/src/components/ui/toaster";
import { Providers } from "@/src/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fashion Store - Premium Clothing E-commerce",
  description: "Discover premium clothing and fashion accessories. Shop the latest trends with secure checkout and fast delivery.",
  keywords: ["fashion", "clothing", "ecommerce", "style", "apparel", "shopping"],
  authors: [{ name: "Fashion Store" }],
  openGraph: {
    title: "Fashion Store - Premium Clothing E-commerce",
    description: "Discover premium clothing and fashion accessories",
    url: "https://fashionstore.com",
    siteName: "Fashion Store",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashion Store - Premium Clothing E-commerce",
    description: "Discover premium clothing and fashion accessories",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
