'use client';

import { Pedido } from "../page";

export type PedidosProps = {
    pedidos: Pedido[];
    isLoading: boolean;
    SetPedido: React.Dispatch<React.SetStateAction<Pedido | null>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function AbreModal(pedido: Pedido, setPedido: React.Dispatch<React.SetStateAction<Pedido | null>>, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, isOpen: boolean) {
        return function (_e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(pedido);
        setPedido(pedido);
        setIsOpen(!isOpen);
    }
}

const Pedidos: React.FC<PedidosProps> = ({ pedidos, isLoading, SetPedido, setIsOpen, isOpen }) => {
    return (
        <div className="w-full">
            <h2 className="mb-2 text-lg font-semibold">Pedidos</h2>
            {isLoading ? (
                <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                    Carregando pedidos...
                </div>
            ) : pedidos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
                    Nenhum pedido foi criado ainda.
                </div>
            ) : (
            <div className="grid grid-cols-1 gap-3 p-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pedidos.map((pedido, index) => (
                    <div 
                    className="min-w-0 cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-md transition duration-150 hover:border-gray-500 hover:shadow-lg" 
                    key={index} 
                    onClick={AbreModal(pedido, SetPedido, setIsOpen, isOpen)}>
                        <p className="break-words font-bold">{pedido.nomeCliente}</p>
                        <p className="line-clamp-2 break-words text-gray-700">Telefone: {pedido.telefone}</p>
                        {pedido.endereco ? (
                            <p className="line-clamp-2 break-words text-gray-700">Endereço: {pedido.endereco.rua}, {pedido.endereco.numero}, {pedido.endereco.bairro}</p>
                        ) : null}
                        <p className="break-words text-gray-700">Status: {pedido.status.nome}</p>
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}

export { Pedidos };
