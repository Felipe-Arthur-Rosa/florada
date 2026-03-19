import { Pedido } from "../app/page";
import { PEDIDO_URL } from "../functions/api";
import { fetchApi } from "./fetch-api";

async function GetPedidoById(id: string): Promise<Pedido | null> {
    try {
        const response = await fetchApi(PEDIDO_URL(id).url);
        const data = await response.json().catch(() => null);

        if (!response.ok || !data) {
            return null;
        }

        return data as Pedido;
    } catch (error) {
        console.error("Erro ao buscar pedido por id:", error);
        return null;
    }
}

export default GetPedidoById;
