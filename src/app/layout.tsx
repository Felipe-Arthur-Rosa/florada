import type { Metadata } from "next";
import "./globals.css";
import ApiStatusPopup from "@/components/apiStatusPopup";
import SiteHeader from "@/components/siteHeader";

export const metadata: Metadata = {
  title: "Florada API",
  description: "Automações florada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body>
          <ApiStatusPopup />
          <SiteHeader />
          <main>{children}</main>
      </body>
    </html>
  );
}
