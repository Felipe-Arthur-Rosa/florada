import { FiltroStatus } from "./filtroStatus";

export function BarraDeBusca() {
    return (
        <div className="items-center mb-4 mt-16 p-6">
            <input
                type="text"
                placeholder="Buscar"
                className="border border-gray-300 rounded-lg p-2 w-1/2 shadow-sm mr-4 md:w-3/4"
            />
            <FiltroStatus titulo="Filtrar por Status" />
        </div>
    );
}