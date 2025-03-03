'use client';

export function FiltroStatus({titulo = "Status"}: {titulo?: string}) {
    const statusOptions = ["Em Atendimento", "Concluído", "Cancelado"];
    
    const filtroStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event.target.value);
    }
    return (
        <select
            className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm"
            onChange={filtroStatus}
        >
            <option value="">{titulo}</option>
            {statusOptions.map((status, index) => (
                <option key={index} value={status.toLowerCase().replace(" ", "_")}>{status}</option>
            ))}
        </select>
    );
}