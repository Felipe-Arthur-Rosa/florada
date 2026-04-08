'use client';

import PedidoPut from "@/actions/pedido-put";
import { pdf } from "@react-pdf/renderer";
import { status } from "../actions/status-get";
import Input from "../app/_components/input";
import { Pedido } from "../app/page";
import React, { useEffect, useRef, useState } from "react";
import DeletePedido from "@/actions/pedido-delete";
import { useRouter } from "next/navigation";
import { MoreVertical, X } from "lucide-react";
import { PedidoPdfDocument } from "./pedido-pdf-document";

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
            <p className="line-clamp-2 break-words rounded border border-transparent pr-2 text-foreground transition hover:border-border hover:bg-muted">
                <strong>{label}:</strong> {value}
            </p>
            <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-border bg-card p-3 text-sm text-card-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 hover:pointer-events-auto hover:opacity-100">
                <strong>{label}:</strong> {value}
            </div>
        </div>
    );
}

function formatEnderecoCompleto(pedido: Pedido | null) {
    if (!pedido?.endereco) {
        return null;
    }

    const campos = [
        { nome: "rua", valor: pedido.endereco.rua },
        { nome: "bairro", valor: pedido.endereco.bairro },
        { nome: "numero", valor: pedido.endereco.numero },
        { nome: "cidade", valor: pedido.endereco.cidade },
    ]
        .map((campo) => ({ ...campo, valor: String(campo.valor ?? "").trim() }))
        .filter((campo) => campo.valor);

    if (campos.length === 0) {
        return null;
    }

    const enderecoCompleto = campos.length === 4;

    return {
        label: enderecoCompleto ? "Endereco" : "Endereco (Incompleto)",
        value: enderecoCompleto
            ? campos.map((campo) => campo.valor).join(", ")
            : campos.map((campo) => `${campo.nome}: ${campo.valor}`).join(", "),
    };
}

function openPdfBlob(blob: Blob) {
    const printUrl = URL.createObjectURL(blob);
    const printWindow = window.open(printUrl, "_blank");

    if (!printWindow) {
        console.error("Nao foi possivel abrir o PDF do pedido.");
        URL.revokeObjectURL(printUrl);
        return;
    }

    window.setTimeout(() => {
        URL.revokeObjectURL(printUrl);
    }, 60_000);
}

const PedidoModal: React.FC<ModalProps> = ({ isOpen, pedido, onClose, onPedidoAlterado }) => {
    const router = useRouter();
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement | null>(null);
    const enderecoCompleto = formatEnderecoCompleto(pedido);

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

    async function ImprimirPedido() {
        if (!pedido) {
            return;
        }

        const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement | null;
        const entregadorInput = document.querySelector('input[name="entregador"]') as HTMLInputElement | null;
        const statusAtual = statusSelect?.value || pedido.status.nome;
        const entregadorAtual = entregadorInput?.value || pedido.entregador || "";

        try {
            const blob = await pdf(
                <PedidoPdfDocument
                    pedido={pedido}
                    statusAtual={statusAtual}
                    entregadorAtual={entregadorAtual}
                />
            ).toBlob();

            openPdfBlob(blob);
        } catch (error) {
            console.error("Nao foi possivel gerar o PDF do pedido:", error);
        }

        setShowActionsMenu(false);
    }


    return (

        <div className="fixed inset-0 flex items-center justify-center bg-foreground/30 px-4" style={{ display: isOpen ? "flex" : "none" }}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (e.target === e.currentTarget) {
                    setShowActionsMenu(false);
                    onClose();
                }
            }}>
            <div className="mb-10 mt-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card p-4 shadow-md">
                <div className="relative mb-2 flex items-center justify-center">
                    <button
                        type="button"
                        aria-label="Fechar modal"
                        onClick={() => {
                            setShowActionsMenu(false);
                            onClose();
                        }}
                        className="absolute left-0 top-0 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="font-bold text-xl text-center">Detalhes do Pedido</h2>
                    <div className="absolute right-0 top-0" ref={actionsMenuRef}>
                        <button
                            type="button"
                            aria-label="Abrir opcoes do pedido"
                            onClick={() => setShowActionsMenu((current) => !current)}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {showActionsMenu ? (
                            <div className="absolute right-0 top-10 z-10 min-w-36 rounded-lg border border-border bg-card py-2 shadow-lg">
                                <button
                                    type="button"
                                    onClick={IrParaEdicao}
                                    className="block w-full px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={ImprimirPedido}
                                    className="block w-full px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                                >
                                    Imprimir guia
                                </button>
                                <button
                                    type="button"
                                    onClick={() => pedido ? ExcluirPedido() : null}
                                    className="block w-full px-4 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
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

                    {enderecoCompleto ?
                        <HoverField label={enderecoCompleto.label} value={enderecoCompleto.value} />
                        : null}

                    {pedido?.endereco?.complemento ?
                        <HoverField label="Complemento" value={pedido.endereco.complemento} />
                        : null}

                    {pedido?.endereco?.dataHoraEntrega ?
                        <HoverField label="Data e Hora de Entrega" value={pedido.endereco.dataHoraEntrega} />
                        : null}

                    {pedido?.metodoPagamento ? <HoverField label="Metodo de Pagamento" value={pedido.metodoPagamento} /> : null}

                    {pedido?.mensagem ?
                        <div className="mt-2 rounded border border-border p-2">
                            <p><strong>Mensagem:</strong></p>
                            <div className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                                <p>{pedido?.mensagem}</p>
                            </div>
                        </div> : null
                    }


                    <p className="mt-2"><strong>Produtos:</strong></p>
                    <div className="max-h-40 list-disc overflow-y-auto rounded border border-border p-2 pl-6">
                        <ul>
                            {pedido?.produtos?.map((produto, index) => (
                                <li key={index}>{produto.nome} - R$ {produto.valor}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="mt-2"><strong>Status</strong></p>
                    <select
                        defaultValue={pedido?.status?.nome || ""}
                        className="mb-3 cursor-pointer rounded-lg border border-input bg-card p-2 text-sm shadow-sm"
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
                            className="rounded bg-primary px-7 py-3 text-primary-foreground transition hover:bg-primary/90"
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
