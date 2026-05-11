import { useState } from "react";
import { Pedido, PedidoSortMode } from "../page";
import GetPedidos from "../../actions/pedido-get";
import { status } from "../../actions/status-get";
import CustomSelect from "./customSelect";

export type PedidosProps = {
    pedidos: Pedido[];
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
    sortMode: PedidoSortMode;
    setSortMode: React.Dispatch<React.SetStateAction<PedidoSortMode>>;
    setHasActiveFilters: React.Dispatch<React.SetStateAction<boolean>>;
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

const sortOptions: { label: string; value: PedidoSortMode }[] = [
    { label: "Criação: mais recente", value: "createdAtDesc" },
    { label: "Criação: mais antigo", value: "createdAtAsc" },
    { label: "Entrega: mais próxima", value: "deliveryDateAsc" },
    { label: "Entrega: mais distante", value: "deliveryDateDesc" },
];

const BarraDeBusca: React.FC<PedidosProps> = ({ setPedidos, sortMode, setSortMode, setHasActiveFilters }) => {
    const [search, setSearch] = useState<string>("");
    const [statusSelecionado, setStatusSelecionado] = useState<string>("");

    return (
        <div className="mb-4 mt-4 grid grid-cols-2 items-center gap-2 sm:mt-5 md:flex md:flex-row md:flex-nowrap md:gap-3">
            <input
                type="text"
                placeholder="Buscar"
                aria-label="Buscar pedidos"
                className="col-span-2 h-12 min-w-0 rounded-lg border border-input bg-card px-3 text-base shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring md:flex-[1_1_calc(100%-22rem)]"
                value={search}
                onChange={(event) => {
                    const busca = event.target.value;
                    setSearch(busca);
                    setHasActiveFilters(busca.trim() !== "" || statusSelecionado !== "");
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
                        setHasActiveFilters(search.trim() !== "" || value !== "");
                        filtrarPedidos(setPedidos, search, value);
                    }}
                />
            </div>
            <div className="min-w-0 md:w-56 md:shrink-0">
                <CustomSelect
                    id="ordenar-pedidos"
                    label="Ordenar pedidos"
                    hideLabel
                    value={sortMode}
                    options={sortOptions}
                    onChange={(value) => setSortMode(value as PedidoSortMode)}
                />
            </div>
        </div>
    );
};

export { BarraDeBusca };
