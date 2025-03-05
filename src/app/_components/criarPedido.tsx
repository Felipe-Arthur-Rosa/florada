'use client';

import { Pedido } from "../page";
import Input from "./input";
import pedidoPost from "@/actions/pedido-post";
import { useState } from "react";
import ResumoPedido from "./resumoPedido";
import { status } from "@/actions/status-get";


export function FormPedido() {

    const [pedido, setPedido] = useState<Pedido>({
        nomeCliente: "",
        destinatario: "",
        mensagem: "",
        telefone: "",
        endereco: {
            rua: "",
            numero: "",
            bairro: "",
            cidade: "",
            complemento: "",
            dataHoraEntrega: ""
        },
        metodoPagamento: "",
        produtos: [],
        valorFinal: 0,
        status: { nome: "ativo" },
        entregador: ""
    });

    function AlimentaProdutos() {
        const produto = document.querySelector('input[name="produto"]') as HTMLInputElement;
        const valor = document.querySelector('input[name="valor"]') as HTMLInputElement;

        if (produto && valor) {
            const novoProduto = {
                id: pedido.produtos.length + 1,
                nome: produto.value,
                valor: parseFloat(valor.value) || 0
            };

            setPedido((prev) => {
                const novosProdutos = [...prev.produtos, novoProduto];
                const novoValorFinal = novosProdutos.reduce((total, p) => total + p.valor, 0); // Soma todos os valores
                const valorfinal = document.querySelector('input[name="valorFinal"]') as HTMLInputElement;
                valorfinal.value = "R$ " + novoValorFinal.toString(); // Atualiza o campo valorFinal
                return {
                    ...prev,
                    produtos: novosProdutos,
                    valorFinal: novoValorFinal // Atualiza o campo valorFinal
                };
            });

            // Limpa os inputs após adicionar o produto
            produto.value = "";
            valor.value = "";
        }
    }

    function AlimentaPedido(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        console.log(name, value)
        // Se for um campo dentro de 'status'
        if (name === "status") {
            console.log("Entou no status")
            setPedido((prev) => ({
                ...prev,
                status: { nome: value }
            }));
            // Se for um campo dentro de 'endereco'
        } else if (["rua", "numero", "bairro", "cidade", "complemento", "dataHoraEntrega"].includes(name)) {
            setPedido((prev) => ({
                ...prev,
                endereco: { ...prev.endereco, [name]: value }
            }));
        } else {
            // Para outros campos normais
            setPedido((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    }

    function CriaPedido(e: React.FormEvent) {
        e.preventDefault(); // Impede o recarregamento da página
        pedidoPost(pedido);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mt-4">
            <form onSubmit={CriaPedido} className="flex flex-col border-collapse border border-gray-300 rounded-lg p-4 shadow-md">
                <Input label="Nome do Cliente" name="nomeCliente" aria-required type="text" onChange={AlimentaPedido} />
                <Input label="Destinatario" name="destinatario" type="text" onChange={AlimentaPedido} />
                <Input label="Telefone" name="telefone" aria-required type="tel" onChange={AlimentaPedido} />
                <Input label="Bairro" name="bairro" type="text" onChange={AlimentaPedido} />
                <Input label="Rua" name="rua" type="text" onChange={AlimentaPedido} />
                <Input label="Número" name="numero" type="number" onChange={AlimentaPedido} />
                <Input label="Cidade" name="cidade" type="text" onChange={AlimentaPedido} />
                <Input label="Complemento" name="complemento" type="text" onChange={AlimentaPedido} />
                <Input label="Data de entrega (Opcional)" name="dataHoraEntrega" type="text" onChange={AlimentaPedido} />
                <Input label="Mensagem do cartão" name="mensagem" type="text" onChange={AlimentaPedido} />
                <Input label="Metodo de Pagamento" name="metodoPagamento" type="text" onChange={AlimentaPedido} />

                {/* Adiciona produtos */}
                <div className="grid grid-cols-2 gap-3">
                    <Input label="Produto" name="produto" type="text" className="col-span-1" />
                    <div className="grid grid-cols-2 gap-3 col-span-1">
                        <Input label="Valor" name="valor" type="number" />
                        <button type="button" className="bg-purple-500 hover:bg-purple-700 text-white font-bold rounded h-12 w-12 mt-4" onClick={AlimentaProdutos}>+</button>
                    </div>
                </div>

                <Input label="Valor final" name="valorFinal" readOnly onChange={AlimentaPedido} />
                
                {/* Status */}
                <h1 className="text-sm font-semibold">Status</h1>
                <select
                    name="status"
                    onChange={AlimentaPedido}
                    value={pedido.status.nome}
                    className="border border-gray-300 rounded-lg p-2 text-sm cursor-pointer shadow-sm"
                >
                    <option value="">Status</option>
                    {status.map((status, index) => (
                        <option key={index} value={status.nome}>{status.nome}</option>
                    ))}
                </select>
                
                {/* Botões */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button className=" bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" type="submit">Criar Pedido</button>
                </div>

            </form>
            <ResumoPedido pedido={pedido} setPedido={setPedido} />
        </div>
    );
}