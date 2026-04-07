'use client';

import { Pedido } from "../page";

export type PedidosProps = {
    pedidos: Pedido[];
    isLoading: boolean;
    SetPedido: React.Dispatch<React.SetStateAction<Pedido | null>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function AbreModal(
    pedido: Pedido,
    setPedido: React.Dispatch<React.SetStateAction<Pedido | null>>,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean
) {
    return function (_e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(pedido);
        setPedido(pedido);
        setIsOpen(!isOpen);
    };
}

function formatEnderecoResumo(pedido: Pedido) {
    if (!pedido.endereco) {
        return null;
    }

    const partes = [pedido.endereco.rua, pedido.endereco.numero, pedido.endereco.bairro]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean);

    return partes.length > 0 ? partes.join(", ") : null;
}

const Pedidos: React.FC<PedidosProps> = ({ pedidos, isLoading, SetPedido, setIsOpen, isOpen }) => {
    return (
        <div className="w-full">
            <h2 className="mb-2 text-lg font-semibold">Pedidos</h2>
            {isLoading ? (
                <div className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
                    Carregando pedidos...
                </div>
            ) : pedidos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center text-muted-foreground">
                    Nenhum pedido foi criado ainda.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 p-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pedidos.map((pedido, index) => {
                        const enderecoResumo = formatEnderecoResumo(pedido);

                        return (
                            <div
                                className="min-w-0 cursor-pointer rounded-lg border border-border bg-card p-4 shadow-md transition duration-150 hover:border-primary/50 hover:bg-secondary/40 hover:shadow-lg"
                                key={index}
                                onClick={AbreModal(pedido, SetPedido, setIsOpen, isOpen)}
                            >
                                <p className="break-words font-bold">{pedido.nomeCliente}</p>
                                <p className="line-clamp-2 break-words text-muted-foreground">Telefone: {pedido.telefone}</p>
                                {enderecoResumo ? (
                                    <p className="line-clamp-2 break-words text-muted-foreground">Endereco: {enderecoResumo}</p>
                                ) : null}
                                <p className="break-words text-muted-foreground">Status: {pedido.status.nome}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export { Pedidos };
