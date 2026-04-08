import { Pedido } from "../app/page";
import { PEDIDO_URL } from '../functions/api';
import { fetchApi } from "./fetch-api";

export type PedidoPostResult = {
    success: boolean;
    statusCode: number | null;
    message: string;
    data?: unknown;
};

function normalizePedidoPayload(pedido: Pedido) {
    const endereco = pedido.endereco
        ? Object.fromEntries(
            Object.entries(pedido.endereco)
                .map(([key, value]) => [key, key === "numero" && value !== undefined && value !== null && value !== "" ? Number(value) : value])
                .filter(([, value]) => value !== undefined && value !== null && value !== "")
        )
        : null;

    return {
        ...pedido,
        endereco: endereco && Object.keys(endereco).length > 0 ? endereco : undefined,
    };
}

function getErrorMessage(data: unknown) {
    if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
        return data.error;
    }

    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        return data.message;
    }

    return "Nao foi possivel cadastrar o pedido.";
}

export default async function pedidoPost(pedido: Pedido) {
    const { url } = PEDIDO_URL();
    const payload = normalizePedidoPayload(pedido);

    try {
        const response = await fetchApi(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return {
                success: false,
                statusCode: response.status,
                message: getErrorMessage(data),
                data,
            } satisfies PedidoPostResult;
        }

        return {
            success: true,
            statusCode: response.status,
            message: "Pedido cadastrado com sucesso.",
            data,
        } satisfies PedidoPostResult;
    } catch (error) {
        return {
            success: false,
            statusCode: null,
            message: error instanceof Error ? error.message : "Nao foi possivel cadastrar o pedido.",
        } satisfies PedidoPostResult;
    }
}
