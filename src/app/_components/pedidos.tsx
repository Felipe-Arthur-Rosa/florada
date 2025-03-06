'use client';

import { Pedido } from "../page";

export type PedidosProps = {
    pedidos: Pedido[];
    SetPedido: React.Dispatch<React.SetStateAction<Pedido | null>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function AbreModal(pedido: Pedido, setPedido: React.Dispatch<React.SetStateAction<Pedido | null>>, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, isOpen: boolean) {
    

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function (_e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(pedido);
        setPedido(pedido);
        setIsOpen(!isOpen);
    }
}

const Pedidos: React.FC<PedidosProps> = ({ pedidos, SetPedido, setIsOpen, isOpen }) => {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-1">Pedidos</h2>
            <div className="grid grid-cols-1 gap-3 p-2 lg:grid-cols-4 ">
                {pedidos && pedidos.map((pedido, index) => (
                    <div 
                    className="bg-white p-4 rounded-lg shadow-md border border-gray-300  cursor-pointer hover:scale-110 duration-150 transition" 
                    key={index} 
                    onClick={AbreModal(pedido, SetPedido, setIsOpen, isOpen)}>
                        <p className="font-bold">{pedido.nomeCliente}</p>
                        <p className="line-clamp-2 text-gray-700">Telefone: {pedido.telefone}</p>
                        <p className="line-clamp-2 text-gray-700">Endereço: {pedido.endereco.rua}, {pedido.endereco.numero}, {pedido.endereco.bairro}</p>
                        <p className="text-gray-700">Status: {pedido.status.nome}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { Pedidos };