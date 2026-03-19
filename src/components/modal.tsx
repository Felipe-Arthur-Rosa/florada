'use client';

import PedidoPut from "@/actions/pedido-put";
import { status } from "../actions/status-get";
import Input from "../app/_components/input";
import { Pedido } from "../app/page";
import React, { useEffect, useRef, useState } from "react";
import DeletePedido from "@/actions/pedido-delete";
import { useRouter } from "next/navigation";
import { MoreVertical, X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    pedido: Pedido | null;
    onClose: () => void;
    onPedidoAlterado: () => void;
}

type HoverFieldProps = {
    label: string;
    value: string;
};

function HoverField({ label, value }: HoverFieldProps) {
    return (
        <div className="group relative mt-2">
            <p className="line-clamp-2 break-words rounded border border-transparent pr-2 text-gray-900 transition hover:border-gray-200 hover:bg-gray-50">
                <strong>{label}:</strong> {value}
            </p>
            <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 opacity-0 shadow-lg transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 hover:pointer-events-auto hover:opacity-100">
                <strong>{label}:</strong> {value}
            </div>
        </div>
    );
}

const PedidoModal: React.FC<ModalProps> = ({ isOpen, pedido, onClose, onPedidoAlterado }) => {
    const router = useRouter();
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!showActionsMenu) {
                return;
            }

            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setShowActionsMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showActionsMenu]);

    if (!isOpen) return null;

    async function ExcluirPedido() {
        if (pedido) {
            try {
                await DeletePedido(pedido._id);
                onClose();
                onPedidoAlterado();
            } catch (error) {
                console.error("Erro ao excluir pedido:", error);
            }
        }
    }

    async function AtualizarPedido() {
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

            try {
                const result = await PedidoPut(pedidoAtualizado);

                if (!result.success) {
                    console.error("Erro ao atualizar pedido:", result.message);
                    return;
                }

                onPedidoAlterado();
                onClose();
            } catch (error) {
                console.error("Erro ao atualizar pedido:", error);
            }
        }
    }

    function IrParaEdicao() {
        if (!pedido) {
            return;
        }

        setShowActionsMenu(false);
        onClose();
        router.push(`/criarPedido?pedidoId=${pedido._id}`);
    }


    return (

        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-30 px-4" style={{ display: isOpen ? "flex" : "none" }}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (e.target === e.currentTarget) {
                    setShowActionsMenu(false);
                    onClose();
                }
            }}>
            <div className="mt-10 mb-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-md">
                <div className="relative mb-2 flex items-center justify-center">
                    <button
                        type="button"
                        aria-label="Fechar modal"
                        onClick={() => {
                            setShowActionsMenu(false);
                            onClose();
                        }}
                        className="absolute left-0 top-0 rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="font-bold text-xl text-center">Detalhes do Pedido</h2>
                    <div className="absolute right-0 top-0" ref={actionsMenuRef}>
                        <button
                            type="button"
                            aria-label="Abrir opcoes do pedido"
                            onClick={() => setShowActionsMenu((current) => !current)}
                            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {showActionsMenu ? (
                            <div className="absolute right-0 top-10 z-10 min-w-36 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                <button
                                    type="button"
                                    onClick={IrParaEdicao}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => pedido ? ExcluirPedido() : null}
                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                >
                                    Excluir
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="break-words pl-4">
                    {pedido?.nomeCliente ? <HoverField label="Cliente" value={pedido.nomeCliente} /> : null}

                    {pedido?.destinatario ? <HoverField label="Destinatario" value={pedido.destinatario} /> : null}

                    <p className="mt-2">Telefone: {pedido?.telefone}</p>

                    {pedido?.endereco ?
                        <HoverField label="Endereço" value={`Rua ${pedido.endereco.rua}, ${pedido.endereco.bairro}, ${pedido.endereco.numero}, ${pedido.endereco.cidade}`} />
                        : null}

                    {pedido?.endereco?.complemento ?
                        <HoverField label="Complemento" value={pedido.endereco.complemento} />
                        : null}

                    {pedido?.endereco?.dataHoraEntrega ?
                        <HoverField label="Data e Hora de Entrega" value={pedido.endereco.dataHoraEntrega} />
                        : null}

                    {pedido?.metodoPagamento ? <HoverField label="Método de Pagamento" value={pedido.metodoPagamento} /> : null}

                    {pedido?.mensagem ?
                        <div className="mt-2 rounded border border-gray-300 p-2">
                            <p><strong>Mensagem:</strong></p>
                            <div className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                                <p>{pedido?.mensagem}</p>
                            </div>
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
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => pedido ? AtualizarPedido() : null}
                            className="px-7 py-3 bg-green-500 hover:bg-green-700 text-white rounded"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { PedidoModal };
