'use client';

import { Pedido } from "../page";
import Input from "./input";
import { X } from "lucide-react";

// preciso de ajuda para fazer com que o resumo do pedido passe a ser um possivel componente e para fazer um set pedido
const statusOptions = ["ativo", "concluido", "Cancelado"];

function RemoveProduto(id: number) {
    return (
        console.log(pedido.produtos.filter(produto => produto.id !== id))
    );
}

const pedido: Pedido =
{
    nomeCliente: "Reginaldo Correia dos Santos",
    destinatario: "Reginaldo",
    mensagem: "Feliz aniversário",
    telefone: "999999999",
    endereco: {
        rua: "Rua dos Bobos",
        numero: "0",
        bairro: "Bairro",
        cidade: "Cidade",
        complemento: "Complemento",
        dataHoraEntrega: "Data e hora de entrega"
    },
    metodoPagamento: "Dinheiro",
    produtos: [
        {
            id: 1,
            nome: "Produto 2",
            valor: 10.00
        },
        {
            id: 2,
            nome: "Produto 2",
            valor: 20.00
        },
        {
            id: 3,
            nome: "Produto 3",
            valor: 30.00
        }
    ],
    valorFinal: 60.00,
    status: {
        nome: "ativo"
    },
    entregador: "Entregador"
};


export function FormPedido() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mt-4">
            <form className="flex flex-col border-collapse border border-gray-300 rounded-lg p-4 shadow-md">
                <Input label="Nome do Cliente" name="nomeCliente" aria-required type="text" />
                <Input label="Telefone" name="telefone" aria-required type="tel" />
                <Input label="Bairro" name="bairro" type="text" />
                <Input label="Rua" name="rua" type="text" />
                <Input label="Número" name="numero" type="number" />
                <Input label="Cidade" name="cidade" type="text" />
                <Input label="Complemento" name="complemento" type="text" />
                <Input label="Quem irá receber" name="destinatario" type="text" />
                <Input label="Data de entrega (Opcional)" name="dataHoraEntrega" type="text" />
                <Input label="Mensagem do cartão" name="mensagem" type="text" />
                <Input label="Metodo de Pagamento" name="metodoPagamento" type="text" />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="Produto" name="produto" type="text" className="col-span-1" />
                    <div className="grid grid-cols-2 gap-3 col-span-1">
                        <Input label="Valor" name="valor" type="number" />
                        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold rounded h-12 w-12 mt-4" type="submit">+</button>
                    </div>
                </div>
                <Input label="Valor final" name="valorFinal" readOnly />
                <h1 className="text-sm font-semibold">Status</h1>
                <select
                    className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm"
                >
                    <option value="">Status</option>
                    {statusOptions.map((status, index) => (
                        <option key={index} value={status.toLowerCase().replace(" ", "_")}>{status}</option>
                    ))}
                </select>

                <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" type="submit">Cancelar</button>
                    <button className=" bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" type="submit">Criar Pedido</button>
                </div>
            </form>
            <div className="flex flex-col border border-gray-300 rounded-lg p-4 shadow-md">
                <h1 className="text-lg font-semibold mb-3">Resumo do Pedido</h1>
                <div className="grid grid-cols-2 gap-3">
                    <p>Nome do Cliente: </p>
                    <p>Reginaldo Correia dos Santos</p>
                    <p>Telefone: </p>
                    <p>Telefone</p>
                    <p>Bairro: </p>
                    <p>Bairro</p>
                    <p>Rua: </p>
                    <p>Rua</p>
                    <p>Número: </p>
                    <p>Número</p>
                    <p>Cidade: </p>
                    <p>Cidade</p>
                    <p>Complemento: </p>
                    <p>Complemento</p>
                    <p>Quem irá receber: </p>
                    <p>Quem irá receber</p>
                    <p>Data de entrega (Opcional): </p>
                    <p>Data de entrega</p>
                    <p>Mensagem do cartão: </p>
                    <p>Mensagem do cartão</p>
                    <p>Metodo de Pagamento: </p>
                    <p>Metodo de Pagamento</p>
                    <p>Produtos </p>
                    <p>Produto e Valor</p>
                    <p>Valor final: </p>
                    <p>Valor final</p>
                    <p>Status: </p>
                    <p>Status</p>
                </div>
                <div className="gap-3 p-2 mt-10 border-collapse border rounded-lg border-gray-300">
                    <h1 className="text-lg font-semibold">Produtos</h1>
                    <div className="flex flex-col gap-2 ">
                        {pedido.produtos.map((produto) => (
                            <div key={produto.id} className="flex items-center justify-between mb-2">
                                <a className="truncate w-1/2">{produto.nome}</a>
                                <a>{"R$ " + produto.valor}</a>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold rounded w-10 h-10 flex items-center justify-center" onClick={() => RemoveProduto(produto.id)}>
                                    <X className="flex items-center justify-center text-white w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}