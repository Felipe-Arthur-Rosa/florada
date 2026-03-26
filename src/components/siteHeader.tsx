"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="border-b border-gray-200 bg-white text-black shadow-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link
                    className="text-lg font-semibold transition hover:opacity-80"
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Florada
                </Link>

                <nav className="hidden items-center gap-4 md:flex">
                    <Link className="rounded-lg px-4 py-2 transition hover:bg-gray-100" href="/criarPedido">
                        Criar Pedido
                    </Link>
                </nav>

                <button
                    type="button"
                    aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                    className="rounded-lg p-2 transition hover:bg-gray-100 md:hidden"
                    onClick={() => setIsMenuOpen((current) => !current)}
                >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {isMenuOpen ? (
                <nav className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
                    <Link
                        className="block rounded-lg px-3 py-2 transition hover:bg-gray-100"
                        href="/criarPedido"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Criar Pedido
                    </Link>
                </nav>
            ) : null}
        </header>
    );
}
