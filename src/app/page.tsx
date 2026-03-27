'use client';

import GetPedidos from "../actions/pedido-get";
import { BarraDeBusca } from "./_components/barraDeBusca";
import { Pedidos } from "./_components/pedidos";
import { useEffect, useState } from "react";
import { ModalProvider } from "@/components/modalProvider";
import { PedidoModal } from "@/components/modal";
import { useRouter } from "next/navigation";

export type Endereco = {
  rua: string,
  numero: string,
  bairro: string,
  cidade: string,
  complemento: string,
  dataHoraEntrega: string
};

export type Produto = {
  id: number,
  nome: string,
  valor: number,
}

export type Status = {
  nome: string
}

export type Pedido = {
  _id: string,
  nomeCliente: string,
  destinatario: string | null,
  mensagem: string,
  telefone: string,
  endereco: Endereco | null,
  metodoPagamento: string,
  produtos: Produto[],
  valorFinal: number,
  status: Status,
  entregador: string | null,
};

export default function Home() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedido, setPedido] = useState<Pedido|null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(true);

  const recarregarPedidos = () => {
    setIsLoadingPedidos(true);
    GetPedidos()
      .then((pedidos) => setPedidos(pedidos))
      .finally(() => setIsLoadingPedidos(false));
  }

  useEffect(() => {
    setIsLoadingPedidos(true);
    GetPedidos()
      .then((pedidos) => setPedidos(pedidos))
      .finally(() => setIsLoadingPedidos(false));
  },
    [setPedidos]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pedidoCriado = params.get("pedidoCriado") === "1";
    const pedidoAtualizado = params.get("pedidoAtualizado") === "1";

    if (pedidoCriado) {
      setSuccessMessage("Pedido cadastrado com sucesso.");
      setShowSuccessMessage(true);
      return;
    }

    if (pedidoAtualizado) {
      setSuccessMessage("Pedido atualizado com sucesso.");
      setShowSuccessMessage(true);
      return;
    }

    setShowSuccessMessage(false);
    setSuccessMessage("");
  }, []);


  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalProvider>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {showSuccessMessage ? (
          <div className="mt-6 rounded-lg border border-status-active/30 bg-secondary px-4 py-3 text-secondary-foreground">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="pr-2">{successMessage}</p>
              <button
                type="button"
                className="self-start rounded px-2 py-1 text-sm transition hover:bg-primary/10"
                onClick={() => {
                  setShowSuccessMessage(false);
                  router.replace("/");
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        ) : null}
        <BarraDeBusca pedidos={pedidos} setPedidos={setPedidos} />
        <Pedidos pedidos={pedidos} isLoading={isLoadingPedidos} SetPedido={setPedido} setIsOpen={setIsOpen} isOpen={isOpen} />
        <PedidoModal isOpen={isOpen} pedido={pedido} onPedidoAlterado={() => { recarregarPedidos() }} onClose={() => {setIsOpen(!isOpen);}} />
      </div>
    </ModalProvider>
  );
}
