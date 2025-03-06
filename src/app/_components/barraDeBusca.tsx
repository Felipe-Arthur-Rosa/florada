import { useState } from "react";
import { Pedido } from "../page";
import GetPedidos from "../../actions/pedido-get";
import { status } from "../../actions/status-get";

export type PedidosProps = {
    pedidos: Pedido[];
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
};

// BUG: a barra de busca não esta levando em consideração o status caso ele ja esteja selecionado
// Não da para fazer uma unica função que leva em consideração o status e a busca ao mesmo tempo



const filtroStatus = (search: string, pedidos: Pedido[], setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>) => {
    return function (event: React.ChangeEvent<HTMLSelectElement>) {
        const status = event.target.value;
        GetPedidos().then((pedidos) => {
            setPedidos(pedidos.filter((pedido: Pedido) => { 
                if (search === "" && status !== "") {
                    return pedido.status.nome === status;
                } else if (search !== "" && status !== "") {
                    return (pedido.nomeCliente.toLowerCase().includes(search.toLowerCase()) || 
                    pedido.telefone.includes(search.toLowerCase()) && pedido.status.nome === status );
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
            GetPedidos().then(pedidos => 
                setPedidos(pedidos.filter((pedido: Pedido) => pedido.nomeCliente.toLowerCase().includes(busca.toLowerCase()) || pedido.telefone.includes(busca) || 
                pedido.endereco.rua.toLowerCase().includes(busca.toLowerCase()) || pedido.endereco.bairro.toLowerCase().includes(busca.toLowerCase())))
            );
        }
    }
}

const BarraDeBusca: React.FC<PedidosProps> = ({ pedidos, setPedidos}) => {

    const [search, setSearch] = useState<string>("");

    return (
        <div className="items-center ml-24 mb-4 mt-16">
            <input
                type="text"
                placeholder="Buscar"
                className="border border-gray-300 rounded-lg p-2 w-1/2 shadow-sm mr-4 md:w-9/12"
                onChange={FiltroDeBusca(setSearch, setPedidos)}
            />
            <select
                className="border flex-1 border-gray-300 rounded-lg p-2 mt-3 md:mt-0 text-sm cursor-pointer shadow-sm"
                onChange={filtroStatus(search, pedidos, setPedidos)}
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