import { PEDIDO_URL } from '../functions/api';

export default async function pedidoPost(formData: FormData) {
    const pedido = Object.fromEntries(formData.entries());

    const { url } = PEDIDO_URL();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido),
    });

    if (!response.ok) {
        throw new Error('Erro ao criar pedido');
    }

    return response.json();
}