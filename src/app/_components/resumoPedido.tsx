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
            <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 text-sm sm:text-base">
                <p>Nome do Cliente: </p>
                {pedido.nomeCliente ? <p className="break-words">{pedido.nomeCliente}</p> : <p></p>}
                <p>Destinatario: </p>
                {pedido.destinatario ? <p className="break-words">{pedido.destinatario}</p> : <p></p>}
                <p>Telefone: </p>
                {pedido.telefone ? <p className="break-words">{pedido.telefone}</p> : <p></p>}
                <p>Bairro: </p>
                {pedido.endereco?.bairro ? <p className="break-words">{pedido.endereco.bairro}</p> : <p></p>}
                <p>Rua: </p>
                {pedido.endereco?.rua ? <p className="break-words">{pedido.endereco.rua}</p> : <p></p>}
                <p>Número: </p>
                {pedido.endereco?.numero ? <p className="break-words">{pedido.endereco.numero}</p> : <p></p>}
                <p>Cidade: </p>
                {pedido.endereco?.cidade ? <p className="break-words">{pedido.endereco.cidade}</p> : <p></p>}
                <p>Complemento: </p>
                {pedido.endereco?.complemento ? <p className="break-words">{pedido.endereco.complemento}</p> : <p></p>}
                <p>Data de entrega: </p>
                {pedido.endereco?.dataHoraEntrega ? <p className="break-words">{pedido.endereco.dataHoraEntrega}</p> : <p></p>}
                <p>Mensagem do cartão: </p>
                {pedido.mensagem ? <p className="break-words">{pedido.mensagem}</p> : <p></p>}
                <p>Metodo de Pagamento: </p>
                {pedido.metodoPagamento ? <p className="break-words">{pedido.metodoPagamento}</p> : <p></p>}
                <p>Valor final: </p>
                {pedido.valorFinal ? <p>R$ {pedido.valorFinal}</p> : <p></p>}
                <p>Status: </p>
                {pedido.status.nome ? <p className="break-words">{pedido.status.nome}</p> : <p></p>}
            </div>
            <div className="mt-2 max-h-60 overflow-y-auto rounded border border-gray-300 p-2">
                <h1 className="text-lg font-semibold">Produtos</h1>
                <div className="flex flex-col gap-2 ">
                    {pedido.produtos.map((produto) => (
                        <div key={produto.id} className="mb-2 flex flex-col gap-2 rounded border border-gray-100 p-2 sm:flex-row sm:items-center sm:justify-between">
                            <a className="break-words sm:max-w-[55%]">{produto.nome}</a>
                            <a className="shrink-0">{"R$ " + produto.valor}</a>
                            <button className="flex h-10 w-full items-center justify-center rounded bg-red-500 font-bold text-white hover:bg-red-700 sm:w-10" onClick={() => RemoveProduto(produto.id)}>
                                <X className="flex items-center justify-center text-white w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
)}
