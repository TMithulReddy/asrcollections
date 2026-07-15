import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://asrcollections.in'),
  title: {
    default: "ASR Collections | Premium Sarees",
    template: "%s", // Sub-pages provide their full string e.g. "Product | ASR Collections"
  },
  description: "Discover our exclusive collection of premium handpicked sarees at ASR Collections.",
  openGraph: {
    title: "ASR Collections | Premium Sarees",
    description: "Discover our exclusive collection of premium handpicked sarees at ASR Collections.",
    url: "/",
    siteName: "ASR Collections",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
