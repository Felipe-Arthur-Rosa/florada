'use client';

import { getPedidoCreatedAtTimestamp } from "@/functions/pedido-date";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import { useMemo } from "react";
import { Pedido, PedidoSortMode } from "../page";

export type PedidosProps = {
    pedidos: Pedido[];
    sortMode: PedidoSortMode;
    isLoading: boolean;
    hasActiveFilters: boolean;
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
        setPedido(pedido);
        setIsOpen(!isOpen);
    };
}

function AbreModalPorTeclado(
    pedido: Pedido,
    setPedido: React.Dispatch<React.SetStateAction<Pedido | null>>,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean
) {
    return function (event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        event.preventDefault();
        setPedido(pedido);
        setIsOpen(!isOpen);
    };
}

function formatEnderecoResumo(pedido: Pedido) {
    if (!pedido.endereco) {
        return null;
    }

    const campos = [
        { nome: "rua", valor: pedido.endereco.rua },
        { nome: "número", valor: pedido.endereco.numero },
        { nome: "bairro", valor: pedido.endereco.bairro },
        { nome: "cidade", valor: pedido.endereco.cidade },
    ]
        .map((campo) => ({ ...campo, valor: String(campo.valor ?? "").trim() }))
        .filter((campo) => campo.valor);

    if (campos.length === 0) {
        return null;
    }

    const enderecoCompleto = campos.length === 4;

    return enderecoCompleto
        ? campos.map((campo) => campo.valor).join(", ")
        : campos.map((campo) => `${campo.nome}: ${campo.valor}`).join(", ");
}

function formatDeliveryDate(value?: string | null) {
    const text = String(value ?? "").trim();
    const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const brDateMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);

    if (!text) {
        return null;
    }

    if (isoDateMatch) {
        const [, year, month, day] = isoDateMatch;
        return `${day}/${month}/${year}`;
    }

    if (brDateMatch) {
        const [, day, month, year] = brDateMatch;
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    return text;
}

function formatCreatedDate(pedido: Pedido) {
    const timestamp = getPedidoCreatedAtTimestamp(pedido);

    if (timestamp === null) {
        return null;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(timestamp));
}

function getProdutoResumo(pedido: Pedido) {
    if (pedido.produtos.length === 0) {
        return null;
    }

    if (pedido.produtos.length === 1) {
        return pedido.produtos[0].nome;
    }

    return `${pedido.produtos[0].nome} +${pedido.produtos.length - 1}`;
}

function parseDateValue(value?: string) {
    if (!value) {
        return null;
    }

    const trimmedValue = value.trim();
    const isoDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const brDateMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);

    if (isoDateMatch) {
        const [, year, month, day] = isoDateMatch;
        return Date.UTC(Number(year), Number(month) - 1, Number(day));
    }

    if (brDateMatch) {
        const [, day, month, year] = brDateMatch;
        return Date.UTC(Number(year), Number(month) - 1, Number(day));
    }

    const normalizedValue = trimmedValue.includes(" ") ? trimmedValue.replace(" ", "T") : trimmedValue;
    const parsedDate = new Date(normalizedValue);
    const timestamp = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());

    return Number.isNaN(timestamp) ? null : timestamp;
}

function normalizeText(value?: string) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function parseExplicitTime(value: string) {
    const timeMatch = value.match(/\b([01]?\d|2[0-3])(?:\s*(?::|h|hrs?|horas?)\s*([0-5]\d)?)?\b/);

    if (!timeMatch) {
        return null;
    }

    const hours = Number(timeMatch[1]);
    const minutes = timeMatch[2] ? Number(timeMatch[2]) : 0;

    if (hours > 23 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
}

function parseDeliveryTimeValue(value?: string) {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return null;
    }

    const explicitTime = parseExplicitTime(normalizedValue);

    if (explicitTime !== null) {
        return explicitTime;
    }

    const hasMorning = normalizedValue.includes("manha");
    const hasAfternoon = normalizedValue.includes("tarde");

    if (hasMorning && !hasAfternoon) {
        return 0;
    }

    if (hasAfternoon && !hasMorning) {
        return 12 * 60;
    }

    return null;
}

function compareNullableValues(currentValue: number | null, nextValue: number | null, direction: "asc" | "desc" = "asc") {
    if (currentValue === null && nextValue === null) {
        return 0;
    }

    if (currentValue === null) {
        return 1;
    }

    if (nextValue === null) {
        return -1;
    }

    return direction === "asc" ? currentValue - nextValue : nextValue - currentValue;
}

function sortPedidos(pedidos: Pedido[], sortMode: PedidoSortMode) {
    return [...pedidos].sort((current, next) => {
        if (sortMode === "deliveryDateAsc" || sortMode === "deliveryDateDesc") {
            const direction = sortMode === "deliveryDateAsc" ? "asc" : "desc";
            const dateComparison = compareNullableValues(
                parseDateValue(current.endereco?.dataHoraEntrega),
                parseDateValue(next.endereco?.dataHoraEntrega),
                direction
            );

            if (dateComparison !== 0) {
                return dateComparison;
            }

            const timeComparison = compareNullableValues(
                parseDeliveryTimeValue(current.endereco?.horaPeriodoEntrega),
                parseDeliveryTimeValue(next.endereco?.horaPeriodoEntrega),
                direction
            );

            if (timeComparison !== 0) {
                return timeComparison;
            }

            return current.nomeCliente.localeCompare(next.nomeCliente);
        }

        const dateComparison = compareNullableValues(
            getPedidoCreatedAtTimestamp(current),
            getPedidoCreatedAtTimestamp(next),
            sortMode === "createdAtDesc" ? "desc" : "asc"
        );

        if (dateComparison !== 0) {
            return dateComparison;
        }

        return current.nomeCliente.localeCompare(next.nomeCliente);
    });
}

function normalizeStatus(status: string) {
    return normalizeText(status);
}

function getStatusBadgeClass(status: string) {
    const normalizedStatus = normalizeStatus(status);

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

const Pedidos: React.FC<PedidosProps> = ({ pedidos, sortMode, isLoading, hasActiveFilters, SetPedido, setIsOpen, isOpen }) => {
    const sortedPedidos = useMemo(() => sortPedidos(pedidos, sortMode), [pedidos, sortMode]);

    return (
        <div className="w-full">
            <h2 className="mb-2 text-lg font-semibold">Pedidos</h2>
            {isLoading ? (
                <div className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
                    Carregando pedidos...
                </div>
            ) : pedidos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center text-muted-foreground">
                    {hasActiveFilters ? "Nenhum pedido encontrado." : "Nenhum pedido foi criado ainda."}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 p-1 md:grid-cols-2 xl:grid-cols-3">
                    {sortedPedidos.map((pedido) => {
                        const enderecoResumo = formatEnderecoResumo(pedido);
                        const createdAt = formatCreatedDate(pedido);
                        const deliveryDate = formatDeliveryDate(pedido.endereco?.dataHoraEntrega);
                        const produtoResumo = getProdutoResumo(pedido);

                        return (
                            <div
                                className="min-w-0 cursor-pointer rounded-lg border border-border bg-card p-5 shadow-md outline-none transition duration-150 hover:border-border hover:bg-muted/45 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
                                key={pedido._id}
                                role="button"
                                tabIndex={0}
                                aria-label={`Abrir detalhes do pedido de ${pedido.nomeCliente}`}
                                onClick={AbreModal(pedido, SetPedido, setIsOpen, isOpen)}
                                onKeyDown={AbreModalPorTeclado(pedido, SetPedido, setIsOpen, isOpen)}
                            >
                                <div className="mb-4 flex min-w-0 items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="line-clamp-1 min-w-0 break-words text-lg font-bold sm:text-xl">{pedido.nomeCliente}</h3>
                                        {produtoResumo ? (
                                            <p className="mt-3 line-clamp-1 break-words text-sm font-medium text-muted-foreground sm:text-base">{produtoResumo}</p>
                                        ) : null}
                                    </div>
                                    <span className={`inline-flex max-w-[12rem] shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(pedido.status.nome)}`}>
                                        <span className="truncate">{pedido.status.nome}</span>
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground sm:text-base">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                                        <span className="line-clamp-1 break-all">{pedido.telefone}</span>
                                    </div>
                                    {enderecoResumo ? (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                                            <span className="line-clamp-1 break-words">{enderecoResumo}</span>
                                        </div>
                                    ) : null}
                                    {createdAt ? (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                                            <span>Criado em {createdAt}</span>
                                        </div>
                                    ) : null}
                                    {deliveryDate ? (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                                            <span>Entrega em {deliveryDate}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export { Pedidos };
