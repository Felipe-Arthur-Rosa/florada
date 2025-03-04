'use client';

import { Pedido } from "../page";

export type PedidosProps = {
    pedidos: Pedido[];
};

const Pedidos: React.FC<PedidosProps> =  ({ pedidos }) => {

    return (
        <div>
            <h2 className="text-lg font-semibold mb-1">Pedidos</h2>
            <div className="grid grid-cols-4 gap-3">
                {pedidos && pedidos.map((pedido, index) => (
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300  cursor-pointer hover:scale-110 duration-150 transition" key={index} onClick={() => console.log(pedido)}>
                        <p className="font-bold">{pedido.nomeCliente}</p>
                        <p className="text-gray-700">Número de Telefone: {pedido.telefone}</p>
                        <p className="text-gray-700">Status: {pedido.status.nome}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { Pedidos };