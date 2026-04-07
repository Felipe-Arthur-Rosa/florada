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

type PrintField = {
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

    const partes = [
        pedido.endereco.rua,
        pedido.endereco.bairro,
        pedido.endereco.numero,
        pedido.endereco.cidade,
    ]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean);

    return partes.length > 0 ? partes.join(", ") : null;
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function buildPrintField(label: string, value: unknown): PrintField | null {
    const text = String(value ?? "").trim();
    return text ? { label, value: text } : null;
}

function buildPedidoPrintHtml(pedido: Pedido, statusAtual: string, entregadorAtual: string) {
    const enderecoCompleto = formatEnderecoCompleto(pedido);
    const campos = [
        buildPrintField("Cliente", pedido.nomeCliente),
        buildPrintField("Destinatario", pedido.destinatario),
        buildPrintField("Telefone", pedido.telefone),
        buildPrintField("Endereco", enderecoCompleto),
        buildPrintField("Complemento", pedido.endereco?.complemento),
        buildPrintField("Data de entrega", pedido.endereco?.dataHoraEntrega),
        buildPrintField("Metodo de pagamento", pedido.metodoPagamento),
        buildPrintField("Status", statusAtual || pedido.status.nome),
        buildPrintField("Entregador", entregadorAtual || pedido.entregador),
        buildPrintField("Pedido", pedido._id),
    ].filter((campo): campo is PrintField => campo !== null);

    const camposHtml = campos
        .map(
            (campo) => `
                <div class="field">
                    <div class="field-label">${escapeHtml(campo.label)}</div>
                    <div class="field-value">${escapeHtml(campo.value)}</div>
                </div>
            `
        )
        .join("");

    const produtosHtml = pedido.produtos
        .map(
            (produto) => `
                <tr>
                    <td>${escapeHtml(produto.nome)}</td>
                    <td class="price">${escapeHtml(formatCurrency(produto.valor))}</td>
                </tr>
            `
        )
        .join("");

    const mensagemHtml = String(pedido.mensagem ?? "").trim()
        ? `
            <section class="section">
                <h2>Mensagem</h2>
                <div class="message">${escapeHtml(pedido.mensagem)}</div>
            </section>
        `
        : "";

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8" />
                <title>Guia do Pedido</title>
                <style>
                    :root {
                        color-scheme: light;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                        font-family: Arial, Helvetica, sans-serif;
                        background: #f4f6f3;
                        color: #1f2933;
                    }
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        padding: 16mm;
                        background: #ffffff;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 16px;
                        border-bottom: 2px solid #d9e3d8;
                        padding-bottom: 12px;
                        margin-bottom: 18px;
                    }
                    .title {
                        margin: 0;
                        font-size: 28px;
                        line-height: 1.1;
                    }
                    .subtitle {
                        margin-top: 6px;
                        color: #52606d;
                        font-size: 14px;
                    }
                    .meta {
                        text-align: right;
                        font-size: 13px;
                        color: #52606d;
                    }
                    .section {
                        margin-top: 20px;
                    }
                    .section h2 {
                        margin: 0 0 12px;
                        font-size: 16px;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 12px;
                    }
                    .field {
                        border: 1px solid #d9e2ec;
                        border-radius: 10px;
                        padding: 10px 12px;
                        background: #fbfcfa;
                        break-inside: avoid;
                    }
                    .field-label {
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: #7b8794;
                        margin-bottom: 6px;
                    }
                    .field-value {
                        font-size: 15px;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid #d9e2ec;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    th, td {
                        padding: 10px 12px;
                        border-bottom: 1px solid #d9e2ec;
                        text-align: left;
                    }
                    th {
                        background: #f0f4f8;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: #52606d;
                    }
                    tr:last-child td {
                        border-bottom: none;
                    }
                    .price {
                        text-align: right;
                        white-space: nowrap;
                    }
                    .total {
                        margin-top: 12px;
                        display: flex;
                        justify-content: flex-end;
                        font-size: 18px;
                        font-weight: 700;
                    }
                    .message {
                        border: 1px solid #d9e2ec;
                        border-radius: 10px;
                        padding: 12px;
                        white-space: pre-wrap;
                        word-break: break-word;
                        background: #fbfcfa;
                    }
                    @media print {
                        body {
                            background: #ffffff;
                        }
                        .page {
                            width: auto;
                            min-height: auto;
                            margin: 0;
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <main class="page">
                    <header class="header">
                        <div>
                            <h1 class="title">Guia de Pedido</h1>
                            <div class="subtitle">Resumo pronto para impressao ou salvar em PDF</div>
                        </div>
                        <div class="meta">
                            <div>Emitido em ${escapeHtml(new Date().toLocaleString("pt-BR"))}</div>
                        </div>
                    </header>

                    <section class="section">
                        <h2>Dados do pedido</h2>
                        <div class="grid">${camposHtml}</div>
                    </section>

                    <section class="section">
                        <h2>Produtos</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th class="price">Valor</th>
                                </tr>
                            </thead>
                            <tbody>${produtosHtml}</tbody>
                        </table>
                        <div class="total">Total: ${escapeHtml(formatCurrency(pedido.valorFinal))}</div>
                    </section>

                    ${mensagemHtml}
                </main>
            </body>
        </html>
    `;
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

    function ImprimirPedido() {
        if (!pedido) {
            return;
        }

        const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement | null;
        const entregadorInput = document.querySelector('input[name="entregador"]') as HTMLInputElement | null;
        const statusAtual = statusSelect?.value || pedido.status.nome;
        const entregadorAtual = entregadorInput?.value || pedido.entregador || "";
        const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");

        if (!printWindow) {
            console.error("Nao foi possivel abrir a janela de impressao.");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(buildPedidoPrintHtml(pedido, statusAtual, entregadorAtual));
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
            printWindow.print();
        };

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
                        <HoverField label="Endereco" value={enderecoCompleto} />
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
