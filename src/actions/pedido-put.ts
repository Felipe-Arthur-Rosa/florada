import { Pedido } from "../app/page";
import { PEDIDO_URL } from '../functions/api';

export default async function PedidoPut(pedido: Pedido) {

    const { url } = PEDIDO_URL(pedido._id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pedidoSemId = removerId(pedido);

    console.log(pedidoSemId);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedidoSemId),
    });

    if (!response.ok) {
        throw new Error('Erro ao Editar pedido');
    }

    return response.json();
}

// Função para remover _id de qualquer objeto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removerId = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(removerId); // Se for um array, aplica recursivamente
  } else if (typeof obj === 'object' && obj !== null) {
    const { _id, ...resto } = obj; // Remove _id do objeto
    return Object.fromEntries(
      Object.entries(resto).map(([key, value]) => [key, removerId(value)])
    );
  }
  return obj; // Se não for objeto ou array, retorna como está
};