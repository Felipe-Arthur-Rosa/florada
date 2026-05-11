'use client';

import PedidoPut from "@/actions/pedido-put";
import CustomSelect from "@/app/_components/customSelect";
import { formatPedidoCreatedAt } from "@/functions/pedido-date";
import { pdf } from "@react-pdf/renderer";
import React, { useEffect, useRef, useState } from "react";
import DeletePedido from "@/actions/pedido-delete";
import { useRouter } from "next/navigation";
import { status } from "../actions/status-get";
import { Pedido } from "../app/page";
import {
    Calendar,
    Clock,
    CreditCard,
    FileText,
    Gift,
    MapPin,
    MessageCircle,
    MoreVertical,
    Package,
    Phone,
    Truck,
    User,
} from "lucide-react";
import { PedidoPdfDocument } from "./pedido-pdf-document";

interface ModalProps {
    isOpen: boolean;
    pedido: Pedido | null;
    onClose: () => void;
    onPedidoAlterado: () => void;
}

type DetailItemProps = {
    icon: React.ReactNode;
    label: string;
    value?: string | number | null;
};

function normalizeStatusName(status: string) {
    return status
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function getStatusBadgeClass(status: string) {
    const normalizedStatus = normalizeStatusName(status);

    if (
        normalizedStatus.includes("cancelado") ||
        normalizedStatus.includes("mal sucedida") ||
        normalizedStatus.includes("erro")
    ) {
        return "border-status-danger/30 bg-status-danger/15 text-status-danger";
    }

    if (
        normalizedStatus.includes("aguardando pagamento") ||
        normalizedStatus.includes("produto finalizado")
    ) {
        return "border-status-warning/35 bg-status-warning/15 text-status-warning";
    }

    if (
        normalizedStatus.includes("em producao") ||
        normalizedStatus.includes("saiu para entrega")
    ) {
        return "border-sage/35 bg-sage/15 text-sage";
    }

    return "border-status-active/30 bg-status-active/15 text-status-active";
}

function DetailItem({ icon, label, value }: DetailItemProps) {
    const text = String(value ?? "").trim();

    if (!text) {
        return null;
    }

    return (
        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/15 text-sage">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="break-words text-sm font-semibold leading-5 text-foreground sm:text-base">{text}</p>
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

function formatDeliveryDate(value?: string | null) {
    const text = String(value ?? "").trim();

    if (!text) {
        return null;
    }

    const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoDateMatch) {
        const [, year, month, day] = isoDateMatch;
        return `${day}/${month}/${year}`;
    }

    const brDateMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);

    if (brDateMatch) {
        const [, day, month, year] = brDateMatch;
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    const timestamp = new Date(text.includes(" ") ? text.replace(" ", "T") : text).getTime();

    if (Number.isNaN(timestamp)) {
        return text;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(timestamp));
}

function openPdfBlob(blob: Blob) {
    const printUrl = URL.createObjectURL(blob);
    const printWindow = window.open(printUrl, "_blank");

    if (!printWindow) {
        console.error("Não foi possível abrir o PDF do pedido.");
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
    const [statusAtual, setStatusAtual] = useState("");
    const actionsMenuRef = useRef<HTMLDivElement | null>(null);
    const enderecoCompleto = formatEnderecoCompleto(pedido);
    const createdAt = pedido ? formatPedidoCreatedAt(pedido) : null;
    const deliveryDate = formatDeliveryDate(pedido?.endereco?.dataHoraEntrega);
    const produtosTotal = pedido?.produtos?.reduce((total, produto) => total + produto.valor, 0) ?? 0;

    useEffect(() => {
        setStatusAtual(pedido?.status?.nome ?? "");
    }, [pedido]);

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
            const entregadorInput = document.querySelector('input[name="entregador"]') as HTMLInputElement;

            const statusSelecionado = statusAtual || pedido.status.nome;
            const entregadorSelecionado = entregadorInput?.value || pedido.entregador;

            const pedidoAtualizado: Pedido = {
                ...pedido,
                status: { nome: statusSelecionado },
                entregador: entregadorSelecionado,
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

        const entregadorInput = document.querySelector('input[name="entregador"]') as HTMLInputElement | null;
        const statusSelecionado = statusAtual || pedido.status.nome;
        const entregadorAtual = entregadorInput?.value || pedido.entregador || "";

        try {
            const blob = await pdf(
                <PedidoPdfDocument
                    pedido={pedido}
                    statusAtual={statusSelecionado}
                    entregadorAtual={entregadorAtual}
                />
            ).toBlob();

            openPdfBlob(blob);
        } catch (error) {
            console.error("Não foi possível gerar o PDF do pedido:", error);
        }

        setShowActionsMenu(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 px-3 py-3 sm:items-center sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pedido-modal-title"
            style={{ display: isOpen ? "flex" : "none" }}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (e.target === e.currentTarget) {
                    setShowActionsMenu(false);
                    onClose();
                }
            }}
        >
            <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                    <h2 id="pedido-modal-title" className="text-xl font-bold leading-tight sm:text-2xl">Detalhes do pedido</h2>
                    <div className="flex items-center gap-2" ref={actionsMenuRef}>
                        {pedido?.status?.nome ? (
                            <span className={`inline-flex max-w-[12rem] items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(pedido.status.nome)}`}>
                                <span className="truncate">{pedido.status.nome}</span>
                            </span>
                        ) : null}
                        <div className="relative">
                            <button
                                type="button"
                                aria-label="Abrir opções do pedido"
                                onClick={() => setShowActionsMenu((current) => !current)}
                                className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <MoreVertical size={20} />
                            </button>
                            {showActionsMenu ? (
                                <div className="absolute right-0 top-10 z-10 min-w-36 rounded-lg border border-border bg-card py-2 shadow-lg">
                                    <button type="button" onClick={IrParaEdicao} className="block w-full px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">Editar</button>
                                    <button type="button" onClick={ImprimirPedido} className="block w-full px-4 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">Imprimir guia</button>
                                    <button type="button" onClick={() => pedido ? ExcluirPedido() : null} className="block w-full px-4 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10">Excluir</button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 px-5 py-5 sm:px-6">
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5">
                        <DetailItem icon={<User size={17} />} label="Cliente" value={pedido?.nomeCliente} />
                        <DetailItem icon={<Gift size={17} />} label="Destinatário" value={pedido?.destinatario} />
                        <DetailItem icon={<Phone size={17} />} label="Telefone" value={pedido?.telefone} />
                        <DetailItem icon={<Calendar size={17} />} label="Data/hora de criação" value={createdAt} />
                        <DetailItem icon={<MapPin size={17} />} label="Endereço" value={enderecoCompleto} />
                        <DetailItem icon={<FileText size={17} />} label="Complemento" value={pedido?.endereco?.complemento} />
                        <DetailItem icon={<Calendar size={17} />} label="Data de entrega" value={deliveryDate} />
                        <DetailItem icon={<Clock size={17} />} label="Horário/período" value={pedido?.endereco?.horaPeriodoEntrega} />
                        <DetailItem icon={<CreditCard size={17} />} label="Pagamento" value={pedido?.metodoPagamento} />
                    </section>

                    {pedido?.mensagem ? (
                        <section className="border-t border-border pt-5">
                            <div className="mb-3 flex items-center gap-2 font-semibold">
                                <MessageCircle className="h-4 w-4 text-sage" aria-hidden="true" />
                                <h3>Mensagem do cartão</h3>
                            </div>
                            <div className="rounded-lg border border-border bg-background/40 p-4">
                                <p className="whitespace-pre-wrap break-words">{pedido.mensagem}</p>
                            </div>
                        </section>
                    ) : null}

                    <section>
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <Package className="h-4 w-4 text-sage" aria-hidden="true" />
                            <h3>Produtos</h3>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-border">
                            {pedido?.produtos?.map((produto, index) => (
                                <div key={produto._id ?? `${produto.nome}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border px-4 py-3 last:border-b-0">
                                    <p className="break-words font-semibold">{produto.nome}</p>
                                    <p className="whitespace-nowrap font-semibold text-muted-foreground">{formatCurrency(produto.valor)}</p>
                                </div>
                            ))}
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-border bg-muted/30 px-4 py-3 font-bold">
                                <p>Total</p>
                                <p className="whitespace-nowrap text-status-active">{formatCurrency(produtosTotal)}</p>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
                        <div>
                            <CustomSelect
                                id="pedido-status"
                                name="status"
                                label="Status"
                                value={statusAtual}
                                placeholder="Status"
                                options={status.map((status) => ({
                                    label: status.nome,
                                    value: status.nome,
                                }))}
                                onChange={setStatusAtual}
                            />
                        </div>
                        <div>
                            <div className="mb-2 flex items-center gap-2 font-semibold">
                                <Truck className="h-4 w-4 text-sage" aria-hidden="true" />
                                <span>Entregador</span>
                            </div>
                            <input
                                aria-label="Nome do entregador"
                                name="entregador"
                                type="text"
                                placeholder="Nome do entregador"
                                defaultValue={pedido?.entregador || ""}
                                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </section>
                </div>

                <div className="flex justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={() => {
                            setShowActionsMenu(false);
                            onClose();
                        }}
                        className="h-11 rounded-lg border border-border bg-card px-5 font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Fechar
                    </button>
                    <button
                        type="button"
                        onClick={() => pedido ? AtualizarPedido() : null}
                        className="h-11 rounded-lg bg-primary px-5 font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export { PedidoModal };
