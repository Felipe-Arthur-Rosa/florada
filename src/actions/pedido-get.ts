import { PEDIDO_URL } from '../functions/api';
import { Pedido } from '../app/page';
import { fetchApi } from './fetch-api';

async function GetPedidos(): Promise<Pedido[]> {
    const url = PEDIDO_URL().url;
    try {
        const response = await fetchApi(url);
        const data = await response.json();

        if (!response.ok) {
            return [];
        }

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        return [];
    }
}

export default GetPedidos;
