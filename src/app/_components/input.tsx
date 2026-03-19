type InputProps = React.ComponentProps<'input'> & {
    label: string;
    error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
    const isRequired = props.required || props["aria-required"];

    return (
        <div className="flex flex-col mb-2">
            <label className="text-sm font-semibold" htmlFor={props.name}>
                {label}
                {isRequired ? <span className="ml-1 text-red-500">*</span> : null}
            </label>
            <input
                {...props}
                className={`rounded-lg border p-2 shadow-sm ${error ? "border-red-400" : "border-gray-300"} ${className}`.trim()}
            />
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
}
