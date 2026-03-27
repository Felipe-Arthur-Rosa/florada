type InputProps = React.ComponentProps<'input'> & {
    label: string;
    error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
    const isRequired = props.required || props["aria-required"];

    return (
        <div className="mb-2 flex flex-col">
            <label className="text-sm font-semibold" htmlFor={props.name}>
                {label}
                {isRequired ? <span className="ml-1 text-destructive">*</span> : null}
            </label>
            <input
                {...props}
                className={`w-full rounded-lg border bg-card p-2 shadow-sm ${error ? "border-destructive" : "border-input"} ${className}`.trim()}
            />
            {error && <span className="mt-1 text-sm text-destructive">{error}</span>}
        </div>
    );
}
