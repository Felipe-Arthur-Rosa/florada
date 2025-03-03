'use client';

export function Pedidos() {
    const pedidos = Array.from({ length: 12 }).map((_, index) => ({
        id: index,
        nome: "Reginaldo Correia dos Santos",
        telefone: "(xx) xxxxx - xxxx",
        status: "Em Atendimento",
    }));

    return (
        <div>
            <h2 className="text-lg font-semibold mb-1">Pedidos</h2>
            <div className="grid grid-cols-4 gap-3">
                {pedidos.map((pedido, index) => (
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300  cursor-pointer hover:scale-110 duration-150 transition" key={index} onClick={() => console.log(pedido)}>
                        <p className="font-bold">{pedido.nome}</p>
                        <p className="text-gray-700">Número de Telefone: {pedido.telefone}</p>
                        <p className="text-gray-700">Status: {pedido.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}