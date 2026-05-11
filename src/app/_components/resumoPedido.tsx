import { ClipboardList, X } from "lucide-react";
import { Pedido } from "../page";

interface ResumoPedidoProps {
    pedido: Pedido;
    setPedido: (pedido: Pedido) => void;
}

function formatDeliveryDate(value?: string | null) {
    const text = String(value ?? "").trim();
    const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!text) return "";

    if (isoDateMatch) {
        const [, year, month, day] = isoDateMatch;
        return `${day}/${month}/${year}`;
    }

    return text;
}

function normalizeStatus(status: string) {
    return status
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function getStatusBadgeClass(status: string) {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus.includes("cancelado") || normalizedStatus.includes("mal sucedida")) {
        return "border-status-danger/30 bg-status-danger/15 text-status-danger";
    }

    if (normalizedStatus.includes("aguardando pagamento") || normalizedStatus.includes("produto finalizado")) {
        return "border-status-warning/35 bg-status-warning/15 text-status-warning";
    }

    if (normalizedStatus.includes("em producao") || normalizedStatus.includes("saiu para entrega")) {
        return "border-sage/35 bg-sage/15 text-sage";
    }

    return "border-status-active/30 bg-status-active/15 text-status-active";
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

type SummaryRowProps = {
    label: string;
    value?: string | number | null;
};

function SummaryRow({ label, value }: SummaryRowProps) {
    const text = String(value ?? "").trim();

    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/70 py-2 text-sm last:border-b-0">
            <span className="shrink-0 font-semibold text-muted-foreground">{label}</span>
            <span className="min-w-0 break-words text-right text-foreground">{text || "--"}</span>
        </div>
    );
}

export default function ResumoPedido({ pedido, setPedido }: ResumoPedidoProps) {
    function RemoveProduto(indexToRemove: number) {
        const novosProdutos = pedido.produtos.filter((_, index) => index !== indexToRemove);
        const novoValorFinal = novosProdutos.reduce((total, produto) => total + produto.valor, 0);
        setPedido({ ...pedido, produtos: novosProdutos, valorFinal: novoValorFinal });
    }

    return (
        <aside className="rounded-lg border border-border bg-card p-5 shadow-md lg:sticky lg:top-5 lg:self-start">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-sage" aria-hidden="true" />
                    <h2 className="text-lg font-semibold">Resumo do pedido</h2>
                </div>
                {pedido.status.nome ? (
                    <span className={`inline-flex max-w-36 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(pedido.status.nome)}`}>
                        <span className="truncate">{pedido.status.nome}</span>
                    </span>
                ) : null}
            </div>

            <div className="space-y-1">
                <SummaryRow label="Nome do cliente" value={pedido.nomeCliente} />
                <SummaryRow label="Destinatário" value={pedido.destinatario} />
                <SummaryRow label="Telefone" value={pedido.telefone} />
                <SummaryRow label="Bairro" value={pedido.endereco?.bairro} />
                <SummaryRow label="Rua" value={pedido.endereco?.rua} />
                <SummaryRow label="Número" value={pedido.endereco?.numero} />
                <SummaryRow label="Cidade" value={pedido.endereco?.cidade} />
                <SummaryRow label="Complemento" value={pedido.endereco?.complemento} />
                <SummaryRow label="Data de entrega" value={formatDeliveryDate(pedido.endereco?.dataHoraEntrega)} />
                <SummaryRow label="Hora/período" value={pedido.endereco?.horaPeriodoEntrega} />
                <SummaryRow label="Mensagem" value={pedido.mensagem} />
                <SummaryRow label="Pagamento" value={pedido.metodoPagamento} />
                <SummaryRow label="Valor final" value={pedido.valorFinal ? formatCurrency(pedido.valorFinal) : ""} />
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-input bg-background shadow-sm">
                <div className="border-b border-input bg-background px-3 py-2 text-sm font-semibold text-foreground">Produtos</div>
                {pedido.produtos.length === 0 ? (
                    <p className="bg-background px-3 py-4 text-sm text-muted-foreground">Nenhum produto adicionado</p>
                ) : (
                    <div className="divide-y divide-input bg-background">
                        {pedido.produtos.map((produto, index) => (
                            <div key={produto._id ?? `${produto.id}-${produto.nome}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-2 text-sm">
                                <span className="min-w-0 break-words font-semibold">{produto.nome}</span>
                                <span className="whitespace-nowrap text-muted-foreground">{formatCurrency(produto.valor)}</span>
                                <button
                                    type="button"
                                    aria-label={`Remover ${produto.nome}`}
                                    className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                                    onClick={() => RemoveProduto(index)}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
