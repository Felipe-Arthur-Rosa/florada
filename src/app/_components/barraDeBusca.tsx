import { useState } from "react";
import { Pedido } from "../page";
import GetPedidos from "../../actions/pedido-get";
import { status } from "../../actions/status-get";

export type PedidosProps = {
    pedidos: Pedido[];
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
};

const filtro = (
    setSearch: React.Dispatch<React.SetStateAction<string>>,
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>
) => {
    return function () {
        GetPedidos().then((pedidos) => {
            const busca = (document.querySelector('input[type="text"]') as HTMLInputElement)?.value || "";
            const status = (document.querySelector('select') as HTMLSelectElement)?.value || "";

            setSearch(busca);

            setPedidos(
                pedidos.filter((pedido: Pedido) => {
                    const atendeBusca =
                        busca === "" ||
                        pedido.nomeCliente.toLowerCase().includes(busca.toLowerCase()) ||
                        pedido.telefone.includes(busca) ||
                        pedido.endereco?.rua.toLowerCase().includes(busca.toLowerCase()) ||
                        pedido.endereco?.bairro.toLowerCase().includes(busca.toLowerCase());

                    const atendeStatus = status === "" || pedido.status.nome === status;

                    return atendeBusca && atendeStatus;
                })
            );
        });
    };
};

const BarraDeBusca: React.FC<PedidosProps> = ({ pedidos, setPedidos}) => {

    const [search, setSearch] = useState<string>("");

    return (
        <div className="mb-4 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <input
                type="text"
                placeholder="Buscar"
                className="w-full rounded-lg border border-input bg-card p-2 shadow-sm sm:flex-1"
                onChange={filtro(setSearch, setPedidos)}
            />
            <select
                className="w-full rounded-lg border border-input bg-card p-2 text-sm shadow-sm sm:w-auto sm:min-w-48"
                onChange={filtro(setSearch, setPedidos)}
            >
                <option value="">Status</option>
                {status.map((status, index) => (
                    <option key={index} value={status.nome}>{status.nome}</option>
                ))}
            </select>
        </div>
    );
}

export { BarraDeBusca };
