'use client';

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CustomSelectOption = {
    label: string;
    value: string;
};

type CustomSelectProps = {
    id: string;
    name?: string;
    label: string;
    value: string;
    options: CustomSelectOption[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    hideLabel?: boolean;
    onChange: (value: string) => void;
};

export default function CustomSelect({
    id,
    name,
    label,
    value,
    options,
    placeholder = "Selecione",
    error,
    required,
    hideLabel,
    onChange,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function selectOption(optionValue: string) {
        onChange(optionValue);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={wrapperRef}>
            {name ? <input type="hidden" name={name} value={value} /> : null}
            <label className={`${hideLabel ? "sr-only" : "mb-2 block text-sm font-semibold"}`} htmlFor={id}>
                {label}
                {required ? <span className="ml-1 text-destructive">*</span> : null}
            </label>
            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`flex h-12 w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 text-left text-base text-foreground shadow-sm outline-none transition hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive" : "border-input"}`}
                onClick={() => setIsOpen((current) => !current)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        setIsOpen(false);
                    }
                }}
            >
                <span className={selectedOption ? "truncate" : "truncate text-muted-foreground"}>
                    {(selectedOption?.label ?? value) || placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-lg border border-input bg-background shadow-xl">
                    <div className="max-h-64 overflow-y-auto p-1" role="listbox" aria-labelledby={id}>
                        {options.map((option) => {
                            const isSelected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`grid min-h-10 w-full grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-md px-2 text-left text-sm font-semibold transition hover:bg-secondary ${isSelected ? "bg-warm text-warm-foreground" : "text-foreground"}`}
                                    onClick={() => selectOption(option.value)}
                                >
                                    {isSelected ? <Check className="h-4 w-4" /> : <span />}
                                    <span className="truncate">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {error ? <span className="mt-1 block text-sm text-destructive">{error}</span> : null}
        </div>
    );
}
