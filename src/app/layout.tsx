import type { Metadata } from "next";
import "./globals.css";
import ApiStatusPopup from "@/components/apiStatusPopup";
import SiteHeader from "@/components/siteHeader";

export const metadata: Metadata = {
  title: "Florada",
  description: "Gestão de pedidos da Florada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="">
      <body>
          <ApiStatusPopup />
          <SiteHeader />
          <main>{children}</main>
      </body>
    </html>
  );
}
