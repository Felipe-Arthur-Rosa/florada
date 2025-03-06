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
                        pedido.endereco.rua.toLowerCase().includes(busca.toLowerCase()) ||
                        pedido.endereco.bairro.toLowerCase().includes(busca.toLowerCase());

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
        <div className="items-center ml-24 mb-4 mt-16">
            <input
                type="text"
                placeholder="Buscar"
                className="border border-gray-300 rounded-lg p-2 w-1/2 shadow-sm mr-4 md:w-9/12"
                onChange={filtro(setSearch, setPedidos)}
            />
            <select
                className="border flex-1 border-gray-300 rounded-lg p-2 mt-3 md:mt-0 text-sm cursor-pointer shadow-sm"
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