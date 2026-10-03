import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khémara Parc",
  description: "Portfolio de Khémara Parc, étudiant en deuxième année de BUT Informatique à l'Université de Nantes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistMono.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
