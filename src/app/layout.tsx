import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

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
          <header className="bg-white text-black p-4 flex justify-between items-center shadow-md top-0 left-0 z-50">
            <Link className="hover:scale-110 duration-150" href={'/'}>Florada</Link>
            <div className="flex gap-4">
              <Link className="bg-white-500 hover:bg-gray-100 hover:scale-110 duration-150 text-black px-4 py-2 rounded-lg" href='/criarPedido' passHref>
                Criar Pedido
              </Link>
            </div>
          </header>
          {children}
      </body>
    </html>
  );
}
