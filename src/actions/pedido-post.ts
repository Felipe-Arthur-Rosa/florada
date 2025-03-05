import { Pedido } from '@/app/page';
import { PEDIDO_URL } from '../functions/api';

export default async function pedidoPost(pedido: Pedido) {

    console.log(pedido);

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