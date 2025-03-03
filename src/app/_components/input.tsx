type InputProps = React.ComponentProps<'input'> & {
    label: string;
    error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
    return (
        <div className="flex flex-col mb-2">
            <label className="text-sm font-semibold" htmlFor={props.name}>{label}</label>
            <input
                {...props}
                className="border border-gray-300 rounded-lg p-2 shadow-sm"
            />
            {error && <span className="text-red-500">{error}</span>}
        </div>
    );
}