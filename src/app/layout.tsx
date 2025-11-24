import type { Metadata } from "next";
import { montserrat, montaguSlab } from "@/components/ui/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "SICJ-UCAB",
  description: "Clinica Juridica para la UCAB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${montaguSlab.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
