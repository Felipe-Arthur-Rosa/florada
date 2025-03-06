'use client';

import GetPedidos from "@/actions/pedido-get";
import { BarraDeBusca } from "./_components/barraDeBusca";
import { Pedidos } from "./_components/pedidos";
import { useEffect, useState } from "react";
import GetStatus from "@/actions/status-get";

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
  nomeCliente: string,
  destinatario: string,
  mensagem: string,
  telefone: string,
  endereco: Endereco,
  metodoPagamento: string,
  produtos: Produto[],
  valorFinal: number,
  status: Status,
  entregador: string | null,
};

export default function Home() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    GetPedidos().then((pedidos) => setPedidos(pedidos));
  },
    [setPedidos]);



  return (
    GetStatus(),
    <div className="flex flex-col justify-center mx-10">
      <BarraDeBusca pedidos={pedidos} setPedidos={setPedidos} />
      <Pedidos pedidos={pedidos} />
    </div>
  );
}