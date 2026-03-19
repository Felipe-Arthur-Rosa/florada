import { PEDIDO_URL } from '../functions/api';
import { fetchApi } from './fetch-api';

async function DeletePedido(id : string) {
    const url = PEDIDO_URL(id).url;
    const response = await fetchApi(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao excluir pedido");
    }

    return response;
}

export default DeletePedido;
