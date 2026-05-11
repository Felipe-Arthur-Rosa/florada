import { Pedido } from "@/app/page";

function parseDateValue(value?: string) {
    if (!value) {
        return null;
    }

    const normalizedValue = value.includes(" ") ? value.replace(" ", "T") : value;
    const timestamp = new Date(normalizedValue).getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
}

export function getPedidoCreatedAtTimestamp(pedido: Pedido) {
    if (pedido.createdAt) {
        return parseDateValue(pedido.createdAt);
    }

    if (/^[a-f\d]{24}$/i.test(pedido._id)) {
        return Number.parseInt(pedido._id.slice(0, 8), 16) * 1000;
    }

    return null;
}

export function formatPedidoCreatedAt(pedido: Pedido) {
    const timestamp = getPedidoCreatedAtTimestamp(pedido);

    if (timestamp === null) {
        return null;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(timestamp));
}
