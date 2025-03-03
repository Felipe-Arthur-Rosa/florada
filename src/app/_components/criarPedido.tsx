import { FiltroStatus } from "./filtroStatus";
import Input from "./input";

export function FormPedido() {
    return (
        <div className="grid-cols-2 max-w-4xl mx-auto">
            <form className="flex-1 columns-1 border-collapse border border-gray-300 rounded-lg p-4 shadow-md">
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
                <div className="grid grid-cols-3 gap-3">
                    <Input label="Produto" name="produto" type="text" />
                    <Input label="Valor" name="valor" type="number" />
                    <button className=" bg-purple-500 hover:bg-purple-700 text-white font-bold rounded h-12 w-12 mt-4" type="submit">+</button>
                </div>
                <Input label="Valor final" name="valorFinal" readOnly />
                <h1 className="text-sm font-semibold">Status</h1>
                <FiltroStatus />
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" type="submit">Cancelar</button>
                    <button className=" bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" type="submit">Criar Pedido</button>
                </div>
            </form>
            <div className="flex-1 border border-gray-300 rounded-lg p-4 shadow-md">
                <h1 className="text-lg font-semibold">Resumo do Pedido</h1>
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
            </div>
        </div>
    );
}