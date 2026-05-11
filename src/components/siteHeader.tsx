"use client";

import Link from "next/link";
import { Menu, Moon, Plus, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function getPreferredTheme(): ThemeMode {
    if (typeof window === "undefined") {
        return "light";
    }

    const savedTheme = window.localStorage.getItem("florada-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>("light");

    useEffect(() => {
        setThemeMode(getPreferredTheme());
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = themeMode;
        window.localStorage.setItem("florada-theme", themeMode);
    }, [themeMode]);

    function toggleTheme() {
        setThemeMode((current) => current === "light" ? "dark" : "light");
    }

    const themeLabel = themeMode === "light" ? "Ativar modo escuro" : "Ativar modo claro";
    const ThemeIcon = themeMode === "light" ? Moon : Sun;

    return (
        <header className="border-b border-border bg-card text-foreground shadow-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link
                    className="text-lg font-semibold transition hover:opacity-80"
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Florada
                </Link>

                <nav className="hidden items-center gap-3 md:flex">
                    <button
                        type="button"
                        aria-label={themeLabel}
                        title={themeLabel}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={toggleTheme}
                    >
                        <ThemeIcon size={18} />
                    </button>
                    <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90" href="/criarPedido">
                        <Plus size={18} />
                        Criar pedido
                    </Link>
                </nav>

                <div className="flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        aria-label={themeLabel}
                        title={themeLabel}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={toggleTheme}
                    >
                        <ThemeIcon size={18} />
                    </button>
                    <button
                        type="button"
                        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setIsMenuOpen((current) => !current)}
                    >
                        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {isMenuOpen ? (
                <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
                    <Link
                        className="block rounded-lg px-3 py-3 transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                        href="/criarPedido"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Criar pedido
                    </Link>
                </nav>
            ) : null}
        </header>
    );
}
