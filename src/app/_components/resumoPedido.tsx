import { X } from "lucide-react";
import { Pedido } from "../page";

interface ResumoPedidoProps {
    pedido: Pedido;
    setPedido: (pedido: Pedido) => void;
}

export default function ResumoPedido({ pedido, setPedido }: ResumoPedidoProps) {

    function RemoveProduto(id: number) {
        const novosProdutos = pedido.produtos.filter(produto => produto.id !== id);
        setPedido({ ...pedido, produtos: novosProdutos });
    }

    return (
        <div className="flex flex-col border border-gray-300 rounded-lg p-4 shadow-md">
            <h1 className="text-lg font-semibold mb-3">Resumo do Pedido</h1>
            <div className="grid grid-cols-2 gap-3">
                <p>Nome do Cliente: </p>
                {pedido.nomeCliente ? <p>{pedido.nomeCliente}</p> : <p></p>}
                <p>Destinatario: </p>
                {pedido.destinatario ? <p>{pedido.destinatario}</p> : <p></p>}
                <p>Telefone: </p>
                {pedido.telefone ? <p>{pedido.telefone}</p> : <p></p>}
                <p>Bairro: </p>
                {pedido.endereco.bairro ? <p>{pedido.endereco.bairro}</p> : <p></p>}
                <p>Rua: </p>
                {pedido.endereco.rua ? <p>{pedido.endereco.rua}</p> : <p></p>}
                <p>Número: </p>
                {pedido.endereco.numero ? <p>{pedido.endereco.numero}</p> : <p></p>}
                <p>Cidade: </p>
                {pedido.endereco.cidade ? <p>{pedido.endereco.cidade}</p> : <p></p>}
                <p>Complemento: </p>
                {pedido.endereco.complemento ? <p>{pedido.endereco.complemento}</p> : <p></p>}
                <p>Data de entrega (Opcional): </p>
                {pedido.endereco.dataHoraEntrega ? <p>{pedido.endereco.dataHoraEntrega}</p> : <p></p>}
                <p>Mensagem do cartão: </p>
                {pedido.mensagem ? <p>{pedido.mensagem}</p> : <p></p>}
                <p>Metodo de Pagamento: </p>
                {pedido.metodoPagamento ? <p>{pedido.metodoPagamento}</p> : <p></p>}
                <p>Valor final: </p>
                {pedido.valorFinal ? <p>R$ {pedido.valorFinal}</p> : <p></p>}
                <p>Status: </p>
                {pedido.status.nome ? <p>{pedido.status.nome}</p> : <p></p>}
            </div>
            <div className="pl-6 list-disc max-h-60 overflow-y-auto border border-gray-300 rounded p-2 mt-2">
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
)}