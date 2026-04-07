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

type FormErrors = {
    nomeCliente?: string;
    telefone?: string;
    metodoPagamento?: string;
    status?: string;
    produtos?: string;
};

function formatPhoneNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "");
    const amount = Number(digits || "0") / 100;

    return amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function parseCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "");
    return Number(digits || "0") / 100;
}

function validatePedido(pedido: Pedido): FormErrors {
    const errors: FormErrors = {};
    const phoneDigits = pedido.telefone.replace(/\D/g, "");

    if (!pedido.nomeCliente.trim()) {
        errors.nomeCliente = "Informe o nome do cliente.";
    }

    if (!phoneDigits) {
        errors.telefone = "Informe o telefone.";
    } else if (phoneDigits.length < 10) {
        errors.telefone = "Informe um telefone valido com DDD.";
    }

    if (!pedido.status.nome.trim()) {
        errors.status = "Selecione um status.";
    }

    if (!pedido.metodoPagamento.trim()) {
        errors.metodoPagamento = "Informe o metodo de pagamento.";
    }

    if (pedido.produtos.length === 0 || pedido.valorFinal <= 0) {
        errors.produtos = "Adicione pelo menos um produto com valor valido.";
    }

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
            dataHoraEntrega: ""
        },
        metodoPagamento: "",
        produtos: [],
        valorFinal: 0,
        status: { nome: "" },
        entregador: ""
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

        if (!pedidoId) {
            return;
        }

        setIsEditMode(true);
        setIsLoadingPedido(true);

        GetPedidoById(pedidoId)
            .then((pedidoEncontrado) => {
                if (!pedidoEncontrado) {
                    setSubmitError(true);
                    setSubmitMessage("Nao foi possivel carregar o pedido para edicao.");
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

        const proximoId = pedido.produtos.reduce((maiorId, produto) => {
            return produto.id > maiorId ? produto.id : maiorId;
        }, 0) + 1;

        const novoProduto = {
            id: proximoId,
            nome: produtoInput.trim(),
            valor: valorNumerico
        };

        setPedido((prev) => {
            const novosProdutos = [...prev.produtos, novoProduto];
            const novoValorFinal = novosProdutos.reduce((total, p) => total + p.valor, 0);

            return {
                ...prev,
                produtos: novosProdutos,
                valorFinal: novoValorFinal
            };
        });

        setProdutoInput("");
        setValorProdutoInput("");
        setFormErrors((prev) => ({ ...prev, produtos: undefined }));
    }

function AlimentaPedido(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
                    status: { nome: rawValue }
                };
            }

            if (["rua", "numero", "bairro", "cidade", "complemento", "dataHoraEntrega"].includes(name)) {
                if (!prev.endereco) {
                    return prev;
                }
                return {
                    ...prev,
                    endereco: { ...prev.endereco, [name]: value }
                };
            }

            return {
                ...prev,
                [name]: value
            };
        });

        if (name in formErrors) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }


    async function CriaPedido(e: React.FormEvent) {
        e.preventDefault();
        const validationErrors = validatePedido(pedido);

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setSubmitError(true);
            setSubmitMessage("Revise os campos obrigatorios antes de enviar.");
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
        <div className="mx-auto mt-4 grid w-full max-w-7xl grid-cols-1 gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-2 lg:px-8">
            <form onSubmit={CriaPedido} className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-md">
                <h1 className="mb-4 text-xl font-semibold">{isEditMode ? "Editar Pedido" : "Criar Pedido"}</h1>
                {submitMessage ? (
                    <div className={`mb-4 rounded-lg border p-3 text-sm ${submitError ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-status-active/30 bg-secondary text-secondary-foreground"}`}>
                        {submitMessage}
                    </div>
                ) : null}
                {isLoadingPedido ? (
                    <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                        Carregando pedido para edicao...
                    </div>
                ) : null}
                <Input label="Nome do Cliente" name="nomeCliente" aria-required type="text" onChange={AlimentaPedido} value={pedido.nomeCliente} error={formErrors.nomeCliente} />
                <Input label="Destinatario" name="destinatario" type="text" onChange={AlimentaPedido} value={pedido.destinatario ?? ""} />
                <Input label="Telefone" name="telefone" aria-required type="tel" onChange={AlimentaPedido} value={pedido.telefone} error={formErrors.telefone} />
                <Input label="Bairro" name="bairro" type="text" onChange={AlimentaPedido} value={pedido.endereco?.bairro ?? ""} />
                <Input label="Rua" name="rua" type="text" onChange={AlimentaPedido} value={pedido.endereco?.rua ?? ""} />
                <Input label="Número" name="numero" type="number" onChange={AlimentaPedido} value={pedido.endereco?.numero ?? ""} />
                <Input label="Cidade" name="cidade" type="text" onChange={AlimentaPedido} value={pedido.endereco?.cidade ?? ""} />
                <Input label="Complemento" name="complemento" type="text" onChange={AlimentaPedido} value={pedido.endereco?.complemento ?? ""} />
                <Input label="Data de entrega" name="dataHoraEntrega" type="text" onChange={AlimentaPedido} value={pedido.endereco?.dataHoraEntrega ?? ""} />
                <Input label="Mensagem do cartão" name="mensagem" type="text" onChange={AlimentaPedido} value={pedido.mensagem} />
                <Input label="Metodo de Pagamento" name="metodoPagamento" aria-required type="text" onChange={AlimentaPedido} value={pedido.metodoPagamento} error={formErrors.metodoPagamento} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                        label="Produto"
                        name="produto"
                        type="text"
                        aria-required
                        value={produtoInput}
                        onChange={(e) => {
                            setProdutoInput(e.target.value);
                            setFormErrors((prev) => ({ ...prev, produtos: undefined }));
                        }}
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <Input
                            label="Valor"
                            name="valor"
                            type="text"
                            inputMode="numeric"
                            value={valorProdutoInput}
                            onChange={(e) => {
                                setValorProdutoInput(formatCurrencyInput(e.target.value));
                                setFormErrors((prev) => ({ ...prev, produtos: undefined }));
                            }}
                        />
                        <button type="button" className="h-12 w-full rounded bg-primary font-bold text-primary-foreground transition hover:bg-primary/90 sm:w-12" onClick={AlimentaProdutos}>+</button>
                    </div>
                </div>
                {formErrors.produtos ? <span className="mb-2 text-sm text-destructive">{formErrors.produtos}</span> : null}

                <Input
                    label="Valor final"
                    name="valorFinal"
                    readOnly
                    value={pedido.valorFinal ? pedido.valorFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : ""}
                />
                
                <h1 className="text-sm font-semibold">Status <span className="text-destructive">*</span></h1>
                <select
                    name="status"
                    onChange={AlimentaPedido}
                    value={pedido.status.nome}
                    className={`w-full cursor-pointer rounded-lg border bg-card p-2 text-sm shadow-sm ${formErrors.status ? "border-destructive" : "border-input"}`}
                >
                    <option value="">Status</option>
                    {status.map((status, index) => (
                        <option key={index} value={status.nome}>{status.nome}</option>
                    ))}
                </select>
                {formErrors.status ? <span className="mt-1 text-sm text-destructive">{formErrors.status}</span> : null}
                
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-7">
                    <Link className="rounded bg-muted px-4 py-2 text-center font-bold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground" href={'/'}>Cancelar</Link>
                    <button className="rounded bg-primary px-4 py-2 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40" disabled={isSubmitting} type="submit">
                        {isSubmitting ? (isEditMode ? "Salvando..." : "Criando...") : (isEditMode ? "Salvar Edicao" : "Criar Pedido")}
                    </button>
                </div>

            </form>
            <ResumoPedido pedido={pedido} setPedido={setPedido} />
        </div>
    );
}
