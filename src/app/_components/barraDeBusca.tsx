import { useState } from "react";
import { Pedido } from "../page";
import GetPedidos from "@/actions/pedido-get";

const statusOptions = ["ativo", "concluido", "Cancelado"];

export type PedidosProps = {
    pedidos: Pedido[];
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
};

const filtroStatus = (search: string, pedidos: Pedido[], setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>) => {
    return function (event: React.ChangeEvent<HTMLSelectElement>) {
        const status = event.target.value;
        GetPedidos().then((pedidos) => {
            setPedidos(pedidos.filter((pedido: Pedido) => { 
                if (search === "" && status !== "") {
                    return pedido.status.nome === status;
                } else if (search !== "" && status !== "") {
                    return (pedido.status.nome === status && pedido.nomeCliente.toLowerCase().includes(search.toLowerCase()));
                } 
                return pedido;
            }));
        });
    }
}


function FiltroDeBusca(setSearch: React.Dispatch<React.SetStateAction<string>>, setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>) {
    return function (event: React.ChangeEvent<HTMLInputElement>) {
        const busca = event.target.value;
        setSearch(busca);
        if (busca === "") {
            GetPedidos().then(pedidos => {
                setPedidos(pedidos);
            });
        } else {
            GetPedidos().then(pedidos => {
                setPedidos(pedidos.filter((pedido: Pedido) => pedido.nomeCliente.toLowerCase().includes(busca.toLowerCase())));
            });
        }
    }
}

const BarraDeBusca: React.FC<PedidosProps> = ({ pedidos, setPedidos }) => {

    const [search, setSearch] = useState<string>("");

    return (
        <div className="items-center mb-4 mt-16 p-6">
            <input
                type="text"
                placeholder="Buscar"
                className="border border-gray-300 rounded-lg p-2 w-1/2 shadow-sm mr-4 md:w-10/12"
                onChange={FiltroDeBusca(setSearch, setPedidos)}
            />
            <select
                className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm"
                onChange={filtroStatus(search, pedidos, setPedidos)}
            >
                <option value="">Status</option>
                {statusOptions.map((status, index) => (
                    <option key={index} value={status.toLowerCase().replace(" ", "_")}>{status}</option>
                ))}
            </select>
        </div>
    );
}

export { BarraDeBusca };