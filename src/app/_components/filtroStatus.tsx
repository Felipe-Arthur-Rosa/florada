'use client';
import GetPedidos from "@/actions/pedido-get";
import { Pedido } from "../page";

const statusOptions = ["ativo", "concluido", "Cancelado"];

export type FiltroProps = {
    search : string,
    titulo : string
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
};

const filtroStatus = (search : string, setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>) => {
    return function (event : React.ChangeEvent<HTMLSelectElement>) {
        const status = event.target.value;
        GetPedidos().then(pedidos => {
            setPedidos(pedidos.filter((pedido : Pedido) => pedido.status.nome === status && pedido.nomeCliente.includes(search)));
         });
    }
}

const FiltroStatus: React.FC<FiltroProps> = ({search, titulo, setPedidos}) => {

    return (
        <select
            className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm"
            onChange={filtroStatus(search, setPedidos)}
        >
            <option value="">{titulo}</option> 
            {statusOptions.map((status, index) => (
                <option key={index} value={status.toLowerCase().replace(" ", "_")}>{status}</option>
            ))}
        </select>
    );
}

export { FiltroStatus };