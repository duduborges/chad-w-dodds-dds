import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chad W. Dodds D.D.S. | General & Cosmetic Dentistry in Twin Falls, ID",
  description:
    "Trusted family dentist in Twin Falls, Idaho. Dr. Chad Dodds offers dental exams, cleanings, whitening, implants, and cosmetic dentistry. 4.9-star rating. Book online today.",
  keywords:
    "dentist twin falls, chad dodds dds, family dentist twin falls idaho, cosmetic dentistry, teeth whitening, dental implants",
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "Chad W. Dodds D.D.S. | General & Cosmetic Dentistry in Twin Falls, ID",
    description:
      "Trusted family dentist in Twin Falls, Idaho. Dr. Chad Dodds offers dental exams, cleanings, whitening, implants, and cosmetic dentistry. 4.9-star rating. Book online today.",
    type: "website",
    locale: "en_US",
    siteName: "Chad W. Dodds D.D.S.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chad W. Dodds D.D.S. | General & Cosmetic Dentistry in Twin Falls, ID",
    description:
      "Trusted family dentist in Twin Falls, Idaho. 4.9-star rating. Book online today.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-[family-name:var(--font-inter)] antialiased">
        {children}
      </body>
    </html>
  );
}
