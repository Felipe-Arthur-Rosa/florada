'use client';

import GetPedidos from "@/actions/pedido-get";
import { BarraDeBusca } from "./_components/barraDeBusca";
// import { FormPedido } from "./_components/criarPedido";
import { Pedidos } from "./_components/pedidos";
import { useEffect, useState } from "react";

export type Endereco = {
  rua: string,
  numero: string,
  bairro: string,
  cidade: string,
  complemento: string,
  dataHoraEntrega: string
};

export type Produto = {
  nome: string,
  valor: number,
}

export type status = {
  nome: string
}

export type Pedido = {
  nomeCliente: string,
  destinatario: string,
  mensagem: string,
  telefone: string,
  endereco: Endereco,
  metodoPagamento: string,
  produtos: [Produto],
  valorFinal: number,
  status: status,
  entregador: string
};

export default function Home() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    GetPedidos().then((pedidos) => setPedidos(pedidos));
    console.log("mudou", pedidos);
  },
    [setPedidos]);

  return (

    <div className="max-w-6xl flex flex-col justify-center mx-auto">
      <BarraDeBusca pedidos = {pedidos} setPedidos={setPedidos} />
      <Pedidos pedidos={pedidos} />
    </div>
  );
}