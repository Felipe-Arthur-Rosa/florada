type InputProps = React.ComponentProps<'input'> & {
    label: string;
    error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
    const isRequired = props.required || props["aria-required"];
    const inputId = props.id || props.name;

    return (
        <div className="mb-2 flex flex-col">
            <label className="text-sm font-semibold" htmlFor={inputId}>
                {label}
                {isRequired ? <span className="ml-1 text-destructive">*</span> : null}
            </label>
            <input
                {...props}
                id={inputId}
                aria-invalid={error ? "true" : undefined}
                className={`h-12 w-full rounded-lg border bg-background px-3 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted read-only:text-muted-foreground ${error ? "border-destructive" : "border-input"} ${className}`.trim()}
            />
            {error && <span className="mt-1 text-sm text-destructive">{error}</span>}
        </div>
    );
}
