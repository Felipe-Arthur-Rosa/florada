import React from "react";

interface Pedido {
    id: number;
    descricao: string;
    valor: number;
}

interface ModalProps {
    isOpen: boolean;
    pedido: Pedido;
    onClose: () => void;
}

export default function PedidoModal({ isOpen, pedido, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md w-80">
                <h2 className="font-bold text-xl mb-2">Detalhes do Pedido</h2>
                <p>ID: {pedido.id}</p>
                <p>Descrição: {pedido.descricao}</p>
                <p>Valor: R$ {pedido.valor}</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}