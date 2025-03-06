import { status } from "../actions/status-get";
import Input from "../app/_components/input";
import { Pedido } from "../app/page";
import React from "react";

interface ModalProps {
    isOpen: boolean;
    pedido: Pedido|null;
    onClose: () => void;
}

const PedidoModal: React.FC<ModalProps> = ({ isOpen, pedido, onClose }) => {
    
    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50" style={{ display: isOpen ? "flex" : "none" }} 
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }}>
            <div className="bg-white p-4 rounded shadow-md w-80">
                <h2 className="font-bold text-xl mb-2">Detalhes do Pedido</h2>

                  
                <p>Cliente: {pedido?.nomeCliente}</p>
                
                {pedido?.destinatario? <p>Destinatario: {pedido?.destinatario}</p> : null} 
                
                <p>Telefone: {pedido?.telefone}</p>

                {pedido?.endereco ? 
                    <p><strong>Endereço:</strong> {pedido.endereco.rua}, {pedido.endereco.bairro}, {pedido.endereco.numero}, {pedido.endereco.cidade}</p>
                : null}

                {pedido?.endereco.complemento ? 
                <p>Complemento: {pedido?.endereco.complemento}</p> 
                : null}

                {pedido?.endereco.dataHoraEntrega ?
                <p>Data e Hora de Entrega: {pedido?.endereco.dataHoraEntrega}</p> 
                : null}

                {pedido?.mensagem ? <p>Mensagem: {pedido?.mensagem} </p> : null}

                <p>Método de Pagamento: {pedido?.metodoPagamento}</p>

                <p>Produtos:</p>
                <ul>
                    {pedido?.produtos.map((produto, index) => (
                        <li key={index}>{produto.nome} - R$ {produto.valor}</li>
                    ))}
                    <p>Valor Final: R$ {pedido?.valorFinal}</p>
                </ul>
                <select
                    className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm"
                >
                    <option value="">Status</option>
                    {status.map((status, index) => (
                        <option key={index} value={status.nome}>{status.nome}</option>
                    ))}
                </select>
                <Input label="Mensagem do cartão" name="mensagem" type="text" />
                <button
                    // onClick={onClose}
                    className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-700 text-white rounded"
                >
                    Salvar
                </button>
                <button
                    // onClick={}
                    className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded"
                >
                    Editar
                </button>
            </div>
        </div>
    ); 
}

export { PedidoModal };