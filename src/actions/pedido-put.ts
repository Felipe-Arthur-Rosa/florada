import { Pedido } from "../app/page";
import { PEDIDO_URL } from '../functions/api';
import { fetchApi } from "./fetch-api";

export type PedidoPutResult = {
  success: boolean;
  statusCode: number | null;
  message: string;
  data?: unknown;
};

function normalizePedidoPayload(pedido: Pedido) {
  const endereco = pedido.endereco
    ? Object.fromEntries(
        Object.entries(pedido.endereco).filter(([, value]) => value !== undefined && value !== null && value !== "")
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

  return "Nao foi possivel editar o pedido.";
}

export default async function PedidoPut(pedido: Pedido) {
    try {
      const { url } = PEDIDO_URL(pedido._id);
      const pedidoSemId = removerId(normalizePedidoPayload(pedido));
      const response = await fetchApi(url, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(pedidoSemId),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          message: getErrorMessage(data),
          data,
        } satisfies PedidoPutResult;
      }

      return {
        success: true,
        statusCode: response.status,
        message: "Pedido atualizado com sucesso.",
        data,
      } satisfies PedidoPutResult;
    } catch (error) {
      return {
        success: false,
        statusCode: null,
        message: error instanceof Error ? error.message : "Nao foi possivel editar o pedido.",
      } satisfies PedidoPutResult;
    }
}

// Função para remover _id de qualquer objeto
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
