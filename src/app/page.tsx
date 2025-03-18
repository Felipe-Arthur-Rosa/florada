'use client';

import GetPedidos from "../actions/pedido-get";
import { BarraDeBusca } from "./_components/barraDeBusca";
import { Pedidos } from "./_components/pedidos";
import { useEffect, useState } from "react";
import { ModalProvider } from "@/components/modalProvider";
import { PedidoModal } from "@/components/modal";

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
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedido, setPedido] = useState<Pedido|null>(null);

  const recarregarPedidos = () => {
    GetPedidos().then((pedidos) => setPedidos(pedidos));
  }

  useEffect(() => {
    GetPedidos().then((pedidos) => setPedidos(pedidos));
  },
    [setPedidos]);


  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalProvider>
      <div className="flex flex-col justify-center mx-10">
        <BarraDeBusca pedidos={pedidos} setPedidos={setPedidos} />
        <Pedidos pedidos={pedidos} SetPedido={setPedido} setIsOpen={setIsOpen} isOpen={isOpen} />
        <PedidoModal isOpen={isOpen} pedido={pedido} onPedidoAlterado={() => { recarregarPedidos() }} onClose={() => {setIsOpen(!isOpen);}} />
      </div>
    </ModalProvider>
  );
}