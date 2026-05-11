'use client';

import { Pedido } from "../page";
import Input from "./input";
import pedidoPost from "../../actions/pedido-post";
import { useEffect, useState } from "react";
import ResumoPedido from "./resumoPedido";
import { status } from "../../actions/status-get";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PedidoPut from "../../actions/pedido-put";
import GetPedidoById from "../../actions/pedido-get-by-id";
import CustomSelect from "./customSelect";

type FormErrors = {
    nomeCliente?: string;
    telefone?: string;
    metodoPagamento?: string;
    status?: string;
    produtos?: string;
};

const MAX_PRODUCT_VALUE = 1_000_000_000_000;

function formatPhoneNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "");
    const amount = Math.min(Number(digits || "0") / 100, MAX_PRODUCT_VALUE);

    return amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function parseCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "");
    return Math.min(Number(digits || "0") / 100, MAX_PRODUCT_VALUE);
}

function validatePedido(pedido: Pedido): FormErrors {
    const errors: FormErrors = {};
    const phoneDigits = pedido.telefone.replace(/\D/g, "");

    if (!pedido.nomeCliente.trim()) errors.nomeCliente = "Informe o nome do cliente.";
    if (!phoneDigits) errors.telefone = "Informe o telefone.";
    else if (phoneDigits.length < 10) errors.telefone = "Informe um telefone válido com DDD.";
    if (!pedido.status.nome.trim()) errors.status = "Selecione um status.";
    if (!pedido.metodoPagamento.trim()) errors.metodoPagamento = "Informe o método de pagamento.";
    if (pedido.produtos.length === 0 || pedido.valorFinal <= 0) errors.produtos = "Adicione pelo menos um produto com valor válido.";

    return errors;
}

function createEmptyPedido(): Pedido {
    return {
        _id: "",
        nomeCliente: "",
        destinatario: "",
        mensagem: "",
        telefone: "",
        endereco: {
            rua: "",
            numero: undefined,
            bairro: "",
            cidade: "",
            complemento: "",
            dataHoraEntrega: "",
            horaPeriodoEntrega: "",
        },
        metodoPagamento: "",
        produtos: [],
        valorFinal: 0,
        status: { nome: "" },
        entregador: "",
    };
}

function normalizePedidoForForm(pedido: Pedido): Pedido {
    return {
        ...createEmptyPedido(),
        ...pedido,
        destinatario: pedido.destinatario ?? "",
        entregador: pedido.entregador ?? "",
        endereco: {
            ...createEmptyPedido().endereco!,
            ...(pedido.endereco ?? {}),
        },
    };
}

export function FormPedido() {
    const router = useRouter();
    const [submitMessage, setSubmitMessage] = useState<string>("");
    const [submitError, setSubmitError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPedido, setIsLoadingPedido] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [produtoInput, setProdutoInput] = useState("");
    const [valorProdutoInput, setValorProdutoInput] = useState("");
    const [pedido, setPedido] = useState<Pedido>(createEmptyPedido());

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pedidoId = params.get("pedidoId");

        if (!pedidoId) return;

        setIsEditMode(true);
        setIsLoadingPedido(true);

        GetPedidoById(pedidoId)
            .then((pedidoEncontrado) => {
                if (!pedidoEncontrado) {
                    setSubmitError(true);
                    setSubmitMessage("Não foi possível carregar o pedido para edição.");
                    return;
                }

                setPedido(normalizePedidoForForm(pedidoEncontrado));
            })
            .finally(() => setIsLoadingPedido(false));
    }, []);

    function AlimentaProdutos() {
        const valorNumerico = parseCurrencyInput(valorProdutoInput);

        if (!produtoInput.trim() || !valorProdutoInput || valorNumerico <= 0) {
            setFormErrors((prev) => ({
                ...prev,
                produtos: "Preencha produto e valor antes de adicionar.",
            }));
            return;
        }

        if (valorNumerico > MAX_PRODUCT_VALUE) {
            setFormErrors((prev) => ({
                ...prev,
                produtos: "O valor máximo por produto é R$ 1.000.000.000.000,00.",
            }));
            return;
        }

        const proximoId = pedido.produtos.reduce((maiorId, produto) => {
            return produto.id > maiorId ? produto.id : maiorId;
        }, 0) + 1;

        const novoProduto = {
            id: proximoId,
            nome: produtoInput.trim(),
            valor: valorNumerico,
        };

        setPedido((prev) => {
            const novosProdutos = [...prev.produtos, novoProduto];
            const novoValorFinal = novosProdutos.reduce((total, p) => total + p.valor, 0);

            return {
                ...prev,
                produtos: novosProdutos,
                valorFinal: novoValorFinal,
            };
        });

        setProdutoInput("");
        setValorProdutoInput("");
        setFormErrors((prev) => ({ ...prev, produtos: undefined }));
    }

    function AlimentaPedido(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value: rawValue } = e.target;
        const value =
            name === "telefone"
                ? formatPhoneNumber(rawValue)
                : name === "numero"
                    ? (rawValue === "" ? undefined : Number(rawValue))
                    : rawValue;

        setPedido((prev) => {
            if (name === "status") {
                return {
                    ...prev,
                    status: { nome: rawValue },
                };
            }

            if (["rua", "numero", "bairro", "cidade", "complemento", "dataHoraEntrega", "horaPeriodoEntrega"].includes(name)) {
                if (!prev.endereco) return prev;
                return {
                    ...prev,
                    endereco: { ...prev.endereco, [name]: value },
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });

        if (name in formErrors) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    function AlimentaStatus(value: string) {
        setPedido((prev) => ({
            ...prev,
            status: { nome: value },
        }));
        setFormErrors((prev) => ({ ...prev, status: undefined }));
    }

    async function CriaPedido(e: React.FormEvent) {
        e.preventDefault();
        const validationErrors = validatePedido(pedido);

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setSubmitError(true);
            setSubmitMessage("Revise os campos obrigatórios antes de enviar.");
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage("");
        setSubmitError(false);
        setFormErrors({});

        const result = isEditMode ? await PedidoPut(pedido) : await pedidoPost(pedido);

        if (result.success) {
            router.push(isEditMode ? "/?pedidoAtualizado=1" : "/?pedidoCriado=1");
            router.refresh();
            return;
        }

        setSubmitError(true);
        setSubmitMessage(result.message);
        setIsSubmitting(false);
    }

    return (
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
            <form onSubmit={CriaPedido} className="rounded-lg border border-border bg-card p-5 shadow-md sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">{isEditMode ? "Editar pedido" : "Criar pedido"}</h1>
                </div>

                {submitMessage ? (
                    <div className={`mb-4 rounded-lg border p-3 text-sm ${submitError ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-status-active/30 bg-secondary text-secondary-foreground"}`}>
                        {submitMessage}
                    </div>
                ) : null}

                {isLoadingPedido ? (
                    <div className="mb-4 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                        Carregando pedido para edição...
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                    <Input label="Nome do cliente" name="nomeCliente" aria-required type="text" placeholder="Ex: Maria Silva" onChange={AlimentaPedido} value={pedido.nomeCliente} error={formErrors.nomeCliente} />
                    <Input label="Destinatário" name="destinatario" type="text" placeholder="Quem recebe" onChange={AlimentaPedido} value={pedido.destinatario ?? ""} />
                    <Input label="Telefone" name="telefone" aria-required type="tel" placeholder="(11) 99999-9999" onChange={AlimentaPedido} value={pedido.telefone} error={formErrors.telefone} />
                    <Input label="Cidade" name="cidade" type="text" placeholder="Ex: São Paulo" onChange={AlimentaPedido} value={pedido.endereco?.cidade ?? ""} />
                    <Input label="Bairro" name="bairro" type="text" placeholder="Ex: Jardins" onChange={AlimentaPedido} value={pedido.endereco?.bairro ?? ""} />
                    <Input label="Rua" name="rua" type="text" placeholder="Nome da rua" onChange={AlimentaPedido} value={pedido.endereco?.rua ?? ""} />
                    <Input label="Número" name="numero" type="number" placeholder="Ex: 123" onChange={AlimentaPedido} value={pedido.endereco?.numero ?? ""} />
                    <Input label="Complemento" name="complemento" type="text" placeholder="Apto, bloco, referência" onChange={AlimentaPedido} value={pedido.endereco?.complemento ?? ""} />
                    <Input label="Data de entrega" name="dataHoraEntrega" type="date" onChange={AlimentaPedido} value={pedido.endereco?.dataHoraEntrega?.slice(0, 10) ?? ""} />
                    <Input label="Hora/período de entrega" name="horaPeriodoEntrega" type="text" maxLength={50} placeholder="Ex: Manhã, 10h-12h" onChange={AlimentaPedido} value={pedido.endereco?.horaPeriodoEntrega ?? ""} />
                    <Input label="Método de pagamento" name="metodoPagamento" aria-required type="text" placeholder="Pix, cartão, dinheiro..." onChange={AlimentaPedido} value={pedido.metodoPagamento} error={formErrors.metodoPagamento} />
                    <Input label="Valor final" name="valorFinal" readOnly value={pedido.valorFinal ? pedido.valorFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"} />
                </div>

                <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold" htmlFor="mensagem">Mensagem do cartão</label>
                    <textarea
                        id="mensagem"
                        name="mensagem"
                        placeholder="Mensagem que acompanha o pedido..."
                        className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        onChange={AlimentaPedido}
                        value={pedido.mensagem}
                    />
                </div>

                <div className="mt-4 max-w-md">
                    <CustomSelect
                        id="status"
                        label="Status"
                        required
                        value={pedido.status.nome}
                        placeholder="Selecione"
                        error={formErrors.status}
                        options={status.map((status) => ({
                            label: status.nome,
                            value: status.nome,
                        }))}
                        onChange={AlimentaStatus}
                    />
                </div>

                <section className="mt-7">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold">Produtos</h2>
                        <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" onClick={AlimentaProdutos}>
                            <span className="text-lg leading-none">+</span>
                            Adicionar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                        <Input
                            label="Produto"
                            name="produto"
                            type="text"
                            aria-required
                            placeholder="Produto"
                            value={produtoInput}
                            onChange={(e) => {
                                setProdutoInput(e.target.value);
                                setFormErrors((prev) => ({ ...prev, produtos: undefined }));
                            }}
                        />
                        <Input
                            label="Valor"
                            name="valor"
                            type="text"
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            value={valorProdutoInput}
                            onChange={(e) => {
                                setValorProdutoInput(formatCurrencyInput(e.target.value));
                                setFormErrors((prev) => ({ ...prev, produtos: undefined }));
                            }}
                        />
                    </div>
                    {formErrors.produtos ? <span className="text-sm text-destructive">{formErrors.produtos}</span> : null}
                </section>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link className="flex h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-center font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" href={'/'}>Cancelar</Link>
                    <button className="h-12 rounded-lg bg-primary px-5 font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-primary/40" disabled={isSubmitting} type="submit">
                        {isSubmitting ? (isEditMode ? "Salvando..." : "Criando...") : (isEditMode ? "Salvar edição" : "Salvar pedido")}
                    </button>
                </div>
            </form>

            <ResumoPedido pedido={pedido} setPedido={setPedido} />
        </div>
    );
}
