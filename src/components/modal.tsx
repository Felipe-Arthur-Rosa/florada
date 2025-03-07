import PedidoPut from "@/actions/pedido-put";
import { status } from "../actions/status-get";
import Input from "../app/_components/input";
import { Pedido } from "../app/page";
import React from "react";
import DeletePedido from "@/actions/pedido-delete";

interface ModalProps {
    isOpen: boolean;
    pedido: Pedido | null;
    onClose: () => void;
    onPedidoAlterado: () => void;
}

const PedidoModal: React.FC<ModalProps> = ({ isOpen, pedido, onClose, onPedidoAlterado }) => {

    if (!isOpen) return null;

    function ExcluirPedido() {
        if (pedido) {
            DeletePedido(pedido._id).then(() => {
                onClose();
                onPedidoAlterado();
            });
        }
    }

    function AtualizarPedido() {
        if (pedido) {
            const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
            const entregadorInput = document.querySelector('input[name="entregador"]') as HTMLInputElement;

            const statusSelecionado = statusSelect?.value || pedido.status.nome;
            const entregadorSelecionado = entregadorInput?.value || pedido.entregador;

            const pedidoAtualizado: Pedido = {
                ...pedido,
                status: { nome: statusSelecionado },
                entregador: entregadorSelecionado
            };

            PedidoPut(pedidoAtualizado);
            onPedidoAlterado();
            onClose();
        }
    }


    return (

        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-30" style={{ display: isOpen ? "flex" : "none" }}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}>
            <div className="bg-white p-4 rounded shadow-md lg:w-1/4 border-collapse border-2 border-gray-300">

                <h2 className="font-bold text-xl text-center mb-2">Detalhes do Pedido</h2>

                <div className="pl-4">
                    <p className="mt-2" >Cliente: {pedido?.nomeCliente}</p>

                    {pedido?.destinatario ? <p className="mt-2">Destinatario: {pedido?.destinatario}</p> : null}

                    <p className="mt-2">Telefone: {pedido?.telefone}</p>

                    {pedido?.endereco ?
                        <p className="mt-2">Endereço: Rua {pedido.endereco.rua}, {pedido.endereco.bairro}, {pedido.endereco.numero}, {pedido.endereco.cidade}</p>
                        : null}

                    {pedido?.endereco.complemento ?
                        <p className="mt-2">Complemento: {pedido?.endereco.complemento}</p>
                        : null}

                    {pedido?.endereco.dataHoraEntrega ?
                        <p className="mt-2">Data e Hora de Entrega: {pedido?.endereco.dataHoraEntrega}</p>
                        : null}

                    <p className="mt-2">Método de Pagamento: {pedido?.metodoPagamento}</p>

                    {pedido?.mensagem ?
                        
                        <div className="list-disc max-h-40 overflow-y-auto border mt-2 border-gray-300 rounded p-2">
                            <p><strong>Mensagem:</strong></p>
                            <p className="mt-2">{pedido?.mensagem} </p>
                        </div> : null
                    }


                    {/* Lista de Produtos */}
                    <p className="mt-2"><strong>Produtos:</strong></p>
                    <div className="pl-6 list-disc max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                        <ul>
                            {pedido?.produtos?.map((produto, index) => (
                                <li key={index}>{produto.nome} - R$ {produto.valor}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="mt-2"><strong>Status</strong></p>
                    <select
                        defaultValue={pedido?.status?.nome || ""}
                        className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm mb-3"
                        name="status"
                    >
                        <option value="">Status</option>
                        {status.map((status, index) => (
                            <option key={index} value={status.nome}>{status.nome}</option>
                        ))}
                    </select>
                    <Input label="Entregador" name="entregador" type="text" defaultValue={pedido?.entregador || ""} />
                    <div className="flex justify-center mt-4 gap-16">
                        <button
                            onClick={() => pedido ? AtualizarPedido() : null}
                            className="px-7 py-3 bg-green-500 hover:bg-green-700 text-white rounded"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => pedido ? ExcluirPedido() : null}
                            className="px-7 py-3 bg-red-500 hover:bg-red-700 text-white rounded"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { PedidoModal };