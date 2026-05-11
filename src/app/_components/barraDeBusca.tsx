import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Pedido, PedidoSortMode } from "../page";
import GetPedidos from "../../actions/pedido-get";
import { status } from "../../actions/status-get";
import CustomSelect from "./customSelect";

export type PedidosProps = {
    pedidos: Pedido[];
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
    sortMode: PedidoSortMode;
    setSortMode: React.Dispatch<React.SetStateAction<PedidoSortMode>>;
};

function filtrarPedidos(setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>, busca: string, statusSelecionado: string) {
    GetPedidos().then((pedidos) => {
        setPedidos(
            pedidos.filter((pedido: Pedido) => {
                const rua = String(pedido.endereco?.rua ?? "").toLowerCase();
                const bairro = String(pedido.endereco?.bairro ?? "").toLowerCase();
                const buscaNormalizada = busca.toLowerCase();

                const atendeBusca =
                    busca === "" ||
                    pedido.nomeCliente.toLowerCase().includes(buscaNormalizada) ||
                    pedido.telefone.includes(busca) ||
                    rua.includes(buscaNormalizada) ||
                    bairro.includes(buscaNormalizada);

                const atendeStatus = statusSelecionado === "" || pedido.status.nome === statusSelecionado;

                return atendeBusca && atendeStatus;
            })
        );
    });
}

const sortLabels: Record<PedidoSortMode, string> = {
    deliveryDate: "Entrega",
    createdAt: "Criação",
};

const BarraDeBusca: React.FC<PedidosProps> = ({ pedidos, setPedidos, sortMode, setSortMode}) => {

    const [search, setSearch] = useState<string>("");
    const [statusSelecionado, setStatusSelecionado] = useState<string>("");

    function toggleSortMode() {
        setSortMode((current) => current === "deliveryDate" ? "createdAt" : "deliveryDate");
    }

    return (
        <div className="mb-4 mt-4 grid grid-cols-2 items-center gap-2 sm:mt-5 md:flex md:flex-row md:flex-nowrap md:gap-3">
            <input
                type="text"
                placeholder="Buscar"
                aria-label="Buscar pedidos"
                className="col-span-2 h-12 min-w-0 rounded-lg border border-input bg-card px-3 text-base shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring md:flex-[1_1_calc(100%-20rem)]"
                value={search}
                onChange={(event) => {
                    const busca = event.target.value;
                    setSearch(busca);
                    filtrarPedidos(setPedidos, busca, statusSelecionado);
                }}
            />
            <div className="min-w-0 md:w-44 md:shrink-0">
                <CustomSelect
                    id="filtro-status"
                    label="Status"
                    hideLabel
                    value={statusSelecionado}
                    placeholder="Status"
                    options={[
                        { label: "Todos", value: "" },
                        ...status.map((status) => ({ label: status.nome, value: status.nome })),
                    ]}
                    onChange={(value) => {
                        setStatusSelecionado(value);
                        filtrarPedidos(setPedidos, search, value);
                    }}
                />
            </div>
            <button
                type="button"
                className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-lg border border-input bg-card px-3 text-base font-medium shadow-sm outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 md:w-44 md:shrink-0"
                onClick={toggleSortMode}
                disabled={pedidos.length === 0}
                title={`Ordenar por data de ${sortLabels[sortMode].toLowerCase()}`}
            >
                <ArrowDownUp aria-hidden="true" size={16} />
                <span className="hidden sm:inline">Ordenar:</span>
                <span>{sortLabels[sortMode]}</span>
            </button>
        </div>
    );
}

export { BarraDeBusca };
