import { PEDIDO_URL } from '../functions/api';

async function DeletePedido(id : string) {
    const url = PEDIDO_URL(id).url;
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response;
}

export default DeletePedido;