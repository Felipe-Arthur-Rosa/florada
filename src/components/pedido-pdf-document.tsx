'use client';

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Pedido } from "../app/page";

type PedidoPdfDocumentProps = {
    pedido: Pedido;
    statusAtual: string;
    entregadorAtual: string;
};

type PrintField = {
    label: string;
    value: string;
};

function formatEnderecoCompleto(pedido: Pedido | null) {
    if (!pedido?.endereco) {
        return null;
    }

    const partes = [
        pedido.endereco.rua,
        pedido.endereco.bairro,
        pedido.endereco.numero,
        pedido.endereco.cidade,
    ]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean);

    return partes.length > 0 ? partes.join(", ") : null;
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function buildPrintField(label: string, value: unknown): PrintField | null {
    const text = String(value ?? "").trim();
    return text ? { label, value: text } : null;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        color: "#1f2933",
        fontFamily: "Helvetica",
        fontSize: 11,
        paddingTop: 36,
        paddingRight: 36,
        paddingBottom: 36,
        paddingLeft: 36,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: "#d9e3d8",
        borderBottomStyle: "solid",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 18,
        paddingBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 6,
    },
    subtitle: {
        color: "#52606d",
        fontSize: 11,
    },
    meta: {
        color: "#52606d",
        fontSize: 10,
        textAlign: "right",
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 10,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    field: {
        width: "48.5%",
        backgroundColor: "#fbfcfa",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 8,
        paddingTop: 9,
        paddingRight: 11,
        paddingBottom: 9,
        paddingLeft: 11,
    },
    fieldLabel: {
        color: "#7b8794",
        fontSize: 9,
        marginBottom: 5,
        textTransform: "uppercase",
    },
    fieldValue: {
        fontSize: 12,
    },
    table: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 8,
        overflow: "hidden",
    },
    tableHeader: {
        backgroundColor: "#f0f4f8",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: "#d9e2ec",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: "#d9e2ec",
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    colProduto: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        paddingTop: 10,
        paddingRight: 12,
        paddingBottom: 10,
        paddingLeft: 12,
    },
    colValor: {
        width: 110,
        paddingTop: 10,
        paddingRight: 12,
        paddingBottom: 10,
        paddingLeft: 12,
        textAlign: "right",
    },
    th: {
        color: "#52606d",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
    },
    total: {
        fontSize: 15,
        fontWeight: 700,
        marginTop: 12,
        textAlign: "right",
    },
    message: {
        backgroundColor: "#fbfcfa",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 8,
        paddingTop: 12,
        paddingRight: 12,
        paddingBottom: 12,
        paddingLeft: 12,
    },
});

export function PedidoPdfDocument({ pedido, statusAtual, entregadorAtual }: PedidoPdfDocumentProps) {
    const enderecoCompleto = formatEnderecoCompleto(pedido);
    const campos = [
        buildPrintField("Cliente", pedido.nomeCliente),
        buildPrintField("Destinatario", pedido.destinatario),
        buildPrintField("Telefone", pedido.telefone),
        buildPrintField("Endereco", enderecoCompleto),
        buildPrintField("Complemento", pedido.endereco?.complemento),
        buildPrintField("Data de entrega", pedido.endereco?.dataHoraEntrega),
        buildPrintField("Metodo de pagamento", pedido.metodoPagamento),
        buildPrintField("Status", statusAtual || pedido.status.nome),
        buildPrintField("Entregador", entregadorAtual || pedido.entregador),
        buildPrintField("Pedido", pedido._id),
    ].filter((campo): campo is PrintField => campo !== null);

    return (
        <Document title={`Pedido ${pedido._id}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Guia de Pedido</Text>
                        <Text style={styles.subtitle}>Resumo pronto para impressao ou salvar em PDF</Text>
                    </View>
                    <View>
                        <Text style={styles.meta}>
                            Emitido em {new Date().toLocaleString("pt-BR")}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados do pedido</Text>
                    <View style={styles.grid}>
                        {campos.map((campo) => (
                            <View key={campo.label} style={styles.field}>
                                <Text style={styles.fieldLabel}>{campo.label}</Text>
                                <Text style={styles.fieldValue}>{campo.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Produtos</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.colProduto, styles.th]}>Produto</Text>
                            <Text style={[styles.colValor, styles.th]}>Valor</Text>
                        </View>
                        {pedido.produtos.map((produto, index) => {
                            const isLastItem = index === pedido.produtos.length - 1;
                            const rowStyle = isLastItem
                                ? [styles.tableRow, styles.tableRowLast]
                                : styles.tableRow;

                            return (
                                <View
                                    key={`${produto.id}-${index}`}
                                    style={rowStyle}
                                >
                                    <Text style={styles.colProduto}>{produto.nome}</Text>
                                    <Text style={styles.colValor}>{formatCurrency(produto.valor)}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <Text style={styles.total}>Total: {formatCurrency(pedido.valorFinal)}</Text>
                </View>

                {pedido.mensagem?.trim() ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mensagem</Text>
                        <View style={styles.message}>
                            <Text>{pedido.mensagem}</Text>
                        </View>
                    </View>
                ) : null}
            </Page>
        </Document>
    );
}
