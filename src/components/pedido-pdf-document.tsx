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

type PdfCard = {
    id: string;
    title: string;
    subtitle: string;
    campos?: PrintField[];
    produtos?: { nome: string; valor: string }[];
    mensagem?: string;
    total?: string;
};

type AuxiliaryCard = {
    id: string;
    title: string;
    subtitle: string;
    campo?: PrintField;
    produtos?: { nome: string; valor: string }[];
    mensagem?: string;
    total?: string;
};

const FIELD_MAX_CHARS = 52;
const ADDRESS_MAX_CHARS = 72;
const PRODUCT_NAME_MAX_CHARS = 42;
const MESSAGE_MAX_CHARS = 180;
const MAX_PRODUCTS_IN_PDF = 6;
const TOTAL_MAX_CHARS = 30;
const CARDS_PER_PAGE = 1;
const MAIN_MAX_FIELDS = 9;
const MAIN_MAX_PRODUCTS = 4;
const MAIN_MESSAGE_MAX_CHARS = 160;
const AUX_FIELD_CHARS_PER_LINE = 28;
const AUX_FIELD_MAX_LINES = 10;
const AUX_MESSAGE_CHARS_PER_LINE = 32;
const AUX_MESSAGE_MAX_LINES = 12;
const AUX_TOTAL_CHARS_PER_LINE = 18;
const AUX_TOTAL_MAX_LINES = 6;
const AUX_PRODUCTS_PER_CARD = 2;
const AUX_PAGE_CAPACITY = 18;
const AUX_MAX_BLOCKS_PER_PAGE = 2;

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

function truncateText(value: string, maxChars: number) {
    const normalizedValue = value.replace(/\s+/g, " ").trim();

    if (normalizedValue.length <= maxChars) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

function buildPrintField(label: string, value: unknown, maxChars = FIELD_MAX_CHARS): PrintField | null {
    const text = String(value ?? "").trim();

    if (!text) {
        return null;
    }

    return {
        label,
        value: truncateText(text, maxChars),
    };
}

function chunkArray<T>(items: T[], size: number) {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

function splitTextIntoLines(value: string, charsPerLine: number) {
    const normalizedValue = value.replace(/\s+/g, " ").trim();

    if (!normalizedValue) {
        return [];
    }

    const lines: string[] = [];
    let remaining = normalizedValue;

    while (remaining.length > charsPerLine) {
        const slice = remaining.slice(0, charsPerLine + 1);
        const breakIndex = slice.lastIndexOf(" ");
        const lineEnd = breakIndex > Math.floor(charsPerLine * 0.5) ? breakIndex : charsPerLine;
        lines.push(remaining.slice(0, lineEnd).trim());
        remaining = remaining.slice(lineEnd).trim();
    }

    if (remaining) {
        lines.push(remaining);
    }

    return lines;
}

function splitTextForAuxiliaryCards(value: string, charsPerLine: number, maxLinesPerCard: number) {
    const lines = splitTextIntoLines(value, charsPerLine);
    return chunkArray(lines, maxLinesPerCard).map((cardLines) => cardLines.join("\n"));
}

function estimateAuxiliaryCardSize(card: AuxiliaryCard) {
    if (card.produtos) {
        return 2 + card.produtos.length * 4;
    }

    if (card.campo) {
        const lineCount = card.campo.value.split("\n").length;
        return 3 + lineCount;
    }

    if (card.mensagem) {
        const lineCount = card.mensagem.split("\n").length;
        return 3 + lineCount;
    }

    if (card.total) {
        const lineCount = card.total.split("\n").length;
        return 3 + lineCount;
    }

    return 4;
}

function packAuxiliaryCards(cards: AuxiliaryCard[]) {
    const pages: AuxiliaryCard[][] = [];
    let currentPage: AuxiliaryCard[] = [];
    let currentSize = 0;

    cards.forEach((card) => {
        const cardSize = estimateAuxiliaryCardSize(card);

        if (
            currentPage.length > 0 &&
            (currentSize + cardSize > AUX_PAGE_CAPACITY || currentPage.length >= AUX_MAX_BLOCKS_PER_PAGE)
        ) {
            pages.push(currentPage);
            currentPage = [];
            currentSize = 0;
        }

        currentPage.push(card);
        currentSize += cardSize;
    });

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    return pages;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        color: "#1f2933",
        fontFamily: "Helvetica",
        fontSize: 8,
        paddingTop: 18,
        paddingRight: 18,
        paddingBottom: 18,
        paddingLeft: 12,
    },
    sheet: {
        flexDirection: "row",
        flexWrap: "wrap",
        height: "100%",
        width: "100%",
    },
    mainPrintArea: {
        height: "50%",
        paddingBottom: 8,
        width: "100%",
    },
    auxiliaryQuadrant: {
        height: 360,
        paddingBottom: 12,
        paddingRight: 12,
        width: 300,
    },
    card: {
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 10,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: "#d9e3d8",
        borderBottomStyle: "solid",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 10,
        paddingBottom: 8,
    },
    title: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 3,
    },
    subtitle: {
        color: "#52606d",
        fontSize: 6.5,
    },
    meta: {
        color: "#52606d",
        fontSize: 6,
        textAlign: "right",
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 6,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    field: {
        width: "48.5%",
        backgroundColor: "#fbfcfa",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 6,
        paddingTop: 4,
        paddingRight: 5,
        paddingBottom: 4,
        paddingLeft: 5,
    },
    fieldLabel: {
        color: "#7b8794",
        fontSize: 5.5,
        marginBottom: 3,
        textTransform: "uppercase",
    },
    fieldValue: {
        fontSize: 8,
    },
    table: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 6,
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
        paddingTop: 4,
        paddingRight: 5,
        paddingBottom: 4,
        paddingLeft: 5,
    },
    colValor: {
        width: 72,
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 4,
        paddingLeft: 8,
        textAlign: "right",
    },
    th: {
        color: "#52606d",
        fontSize: 6,
        fontWeight: 700,
        textTransform: "uppercase",
    },
    total: {
        fontSize: 9.5,
        fontWeight: 700,
        marginTop: 8,
        textAlign: "right",
    },
    message: {
        backgroundColor: "#fbfcfa",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 6,
        paddingTop: 6,
        paddingRight: 6,
        paddingBottom: 6,
        paddingLeft: 6,
    },
    auxiliaryBlock: {
        backgroundColor: "#fbfcfa",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 8,
        marginTop: 8,
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
    },
    auxiliarySection: {
        marginTop: 8,
    },
    auxiliarySubtitle: {
        color: "#52606d",
        fontSize: 6.5,
        marginBottom: 6,
    },
    auxiliaryLabel: {
        color: "#52606d",
        fontSize: 8,
        fontWeight: 700,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    auxiliaryText: {
        fontSize: 8,
        lineHeight: 1.25,
    },
    auxiliaryProductBlock: {
        backgroundColor: "#fbfcfa",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#d9e2ec",
        borderRadius: 8,
        marginTop: 8,
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
    },
    auxiliaryProductName: {
        fontSize: 8,
        lineHeight: 1.25,
        marginBottom: 6,
    },
    auxiliaryProductValue: {
        fontSize: 7,
        fontWeight: 700,
        textAlign: "right",
    },
});

export function PedidoPdfDocument({ pedido, statusAtual, entregadorAtual }: PedidoPdfDocumentProps) {
    const enderecoCompleto = formatEnderecoCompleto(pedido);
    const fullFieldValues = [
        { label: "Cliente", value: String(pedido.nomeCliente ?? "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Destinatario", value: String(pedido.destinatario ?? "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Telefone", value: String(pedido.telefone ?? "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Endereco", value: String(enderecoCompleto ?? "").trim(), maxChars: ADDRESS_MAX_CHARS },
        { label: "Complemento", value: String(pedido.endereco?.complemento ?? "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Data de entrega", value: String(pedido.endereco?.dataHoraEntrega ?? "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Metodo de pagamento", value: String(pedido.metodoPagamento ?? "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Status", value: String(statusAtual || pedido.status.nome || "").trim(), maxChars: FIELD_MAX_CHARS },
        { label: "Entregador", value: String(entregadorAtual || pedido.entregador || "").trim(), maxChars: FIELD_MAX_CHARS },
    ].filter((campo) => campo.value);
    const produtosOriginais = pedido.produtos.map((produto) => ({
        nome: String(produto.nome ?? "").trim(),
        valor: formatCurrency(produto.valor),
    }));
    const produtosFormatados = produtosOriginais.map((produto) => ({
        nome: truncateText(produto.nome, PRODUCT_NAME_MAX_CHARS),
        valor: produto.valor,
    }));
    const produtoChunks = chunkArray(produtosFormatados, MAX_PRODUCTS_IN_PDF);
    const camposFormatados = fullFieldValues
        .map((campo) => buildPrintField(campo.label, campo.value, campo.maxChars))
        .filter((campo): campo is PrintField => campo !== null);
    const camposPrincipais = camposFormatados.slice(0, MAIN_MAX_FIELDS);
    const camposExcedentes = fullFieldValues.slice(MAIN_MAX_FIELDS);
    const totalFormatado = formatCurrency(pedido.valorFinal);
    const totalPrincipal = truncateText(totalFormatado, TOTAL_MAX_CHARS);
    const mensagemOriginal = String(pedido.mensagem ?? "").trim();
    const mensagemPrincipal = mensagemOriginal ? truncateText(mensagemOriginal, MAIN_MESSAGE_MAX_CHARS) : "";
    const produtosPrincipais = produtosFormatados.slice(0, MAIN_MAX_PRODUCTS);
    const cards: PdfCard[] = [];
    const auxiliaryCards: AuxiliaryCard[] = [];

    cards.push({
        id: "principal",
        title: "Guia de Pedido",
        subtitle: "Resumo principal do pedido",
        campos: camposPrincipais,
        produtos: produtosPrincipais,
        mensagem: mensagemOriginal && mensagemOriginal.length <= MAIN_MESSAGE_MAX_CHARS ? mensagemPrincipal : undefined,
        total: totalPrincipal,
    });

    camposExcedentes.forEach((campo, index) => {
        const fieldSegments = splitTextForAuxiliaryCards(
            campo.value,
            AUX_FIELD_CHARS_PER_LINE,
            AUX_FIELD_MAX_LINES
        );

        fieldSegments.forEach((segment, segmentIndex) => {
            auxiliaryCards.push({
                id: `campo-extra-${index + 1}-${segmentIndex + 1}`,
                title: "Guia Auxiliar",
                subtitle: fieldSegments.length > 1 ? "Campo adicional do pedido (cont.)" : "Campo adicional do pedido",
                campo: {
                    label: fieldSegments.length > 1 ? `${campo.label} (${segmentIndex + 1}/${fieldSegments.length})` : campo.label,
                    value: segment,
                },
            });
        });
    });

    fullFieldValues.slice(0, MAIN_MAX_FIELDS).forEach((campo, index) => {
        if (campo.value.length > campo.maxChars) {
            const fieldSegments = splitTextForAuxiliaryCards(
                campo.value,
                AUX_FIELD_CHARS_PER_LINE,
                AUX_FIELD_MAX_LINES
            );

            fieldSegments.forEach((segment, segmentIndex) => {
                auxiliaryCards.push({
                    id: `campo-${index + 1}-${segmentIndex + 1}`,
                    title: "Guia Auxiliar",
                    subtitle: fieldSegments.length > 1 ? "Campo com conteudo completo (cont.)" : "Campo com conteudo completo",
                    campo: {
                        label: fieldSegments.length > 1 ? `${campo.label} (${segmentIndex + 1}/${fieldSegments.length})` : campo.label,
                        value: segment,
                    },
                });
            });
        }
    });

    const hasHiddenProducts = pedido.produtos.length > MAIN_MAX_PRODUCTS;
    const hasTruncatedProducts = produtosOriginais.some((produto, index) => produto.nome !== produtosFormatados[index]?.nome);

    if (hasHiddenProducts || hasTruncatedProducts) {
        chunkArray(
            produtosOriginais,
            AUX_PRODUCTS_PER_CARD
        ).forEach((produtos, index, chunks) => {
            auxiliaryCards.push({
                id: `produtos-completo-${index + 1}`,
                title: "Guia Auxiliar",
                subtitle: chunks.length > 1 ? `Lista completa de produtos (${index + 1}/${chunks.length})` : "Lista completa de produtos",
                produtos,
            });
        });
    }

    if (totalFormatado.length > TOTAL_MAX_CHARS) {
        splitTextForAuxiliaryCards(
            totalFormatado,
            AUX_TOTAL_CHARS_PER_LINE,
            AUX_TOTAL_MAX_LINES
        ).forEach((segment, index, segments) => {
            auxiliaryCards.push({
                id: `total-completo-${index + 1}`,
                title: "Guia Auxiliar",
                subtitle: segments.length > 1 ? `Valor total completo (${index + 1}/${segments.length})` : "Valor total completo",
                total: segment,
            });
        });
    }

    if (mensagemOriginal.length > MESSAGE_MAX_CHARS) {
        splitTextForAuxiliaryCards(
            mensagemOriginal,
            AUX_MESSAGE_CHARS_PER_LINE,
            AUX_MESSAGE_MAX_LINES
        ).forEach((segment, index, segments) => {
            auxiliaryCards.push({
                id: `mensagem-completa-${index + 1}`,
                title: "Guia Auxiliar",
                subtitle: segments.length > 1 ? `Mensagem completa (${index + 1}/${segments.length})` : "Mensagem completa",
                mensagem: segment,
            });
        });
    } else if (mensagemOriginal.length > MAIN_MESSAGE_MAX_CHARS) {
        auxiliaryCards.push({
            id: "mensagem-curta-completa",
            title: "Guia Auxiliar",
            subtitle: "Mensagem completa",
            mensagem: mensagemOriginal,
        });
    }

    const cardPages = chunkArray(cards, CARDS_PER_PAGE);
    const auxiliaryPages = packAuxiliaryCards(auxiliaryCards);

    return (
        <Document title={`Pedido ${pedido._id}`}>
            {cardPages.map((pageCards, pageIndex) => (
                <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
                    <View style={styles.sheet}>
                        {pageCards.map((card) => (
                            <View key={card.id} style={styles.mainPrintArea}>
                                <View style={styles.card}>
                                    <View style={styles.header}>
                                        <View>
                                            <Text style={styles.title}>{card.title}</Text>
                                            <Text style={styles.subtitle}>{card.subtitle}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.meta}>
                                                Emitido em {new Date().toLocaleString("pt-BR")}
                                            </Text>
                                        </View>
                                    </View>

                                    {card.campos && card.campos.length > 0 ? (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Dados do pedido</Text>
                                            <View style={styles.grid}>
                                                {card.campos.map((campo, index) => (
                                                    <View key={`${card.id}-${campo.label}-${index}`} style={styles.field}>
                                                        <Text style={styles.fieldLabel}>{campo.label}</Text>
                                                        <Text style={styles.fieldValue}>{campo.value}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ) : null}

                                    {card.produtos && card.produtos.length > 0 ? (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Produtos</Text>
                                            <View style={styles.table}>
                                                <View style={styles.tableHeader}>
                                                    <Text style={[styles.colProduto, styles.th]}>Produto</Text>
                                                    <Text style={[styles.colValor, styles.th]}>Valor</Text>
                                                </View>
                                                {card.produtos.map((produto, index) => {
                                                    const isLastItem = index === card.produtos!.length - 1;
                                                    const rowStyle = isLastItem
                                                        ? [styles.tableRow, styles.tableRowLast]
                                                        : styles.tableRow;

                                                    return (
                                                        <View key={`${card.id}-produto-${index}`} style={rowStyle}>
                                                            <Text style={styles.colProduto}>{produto.nome}</Text>
                                                            <Text style={styles.colValor}>{produto.valor}</Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    ) : null}

                                    {card.total ? (
                                        <View style={styles.section}>
                                            <Text style={styles.total}>Total: {card.total}</Text>
                                        </View>
                                    ) : null}

                                    {card.mensagem ? (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Mensagem</Text>
                                            <View style={styles.message}>
                                                <Text>{card.mensagem}</Text>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        ))}
                    </View>
                </Page>
            ))}
            {auxiliaryPages.map((pageCards, pageIndex) => (
                <Page key={`aux-${pageIndex}`} size="A4" style={styles.page}>
                    <View style={styles.auxiliaryQuadrant}>
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>Guia Auxiliar</Text>
                                    <Text style={styles.subtitle}>Complementos do pedido</Text>
                                </View>
                                <View>
                                    <Text style={styles.meta}>
                                        Emitido em {new Date().toLocaleString("pt-BR")}
                                    </Text>
                                </View>
                            </View>

                            {pageCards.map((card) => (
                                <View key={card.id} style={styles.auxiliarySection} wrap={false}>
                                    <Text style={styles.auxiliarySubtitle}>{card.subtitle}</Text>

                                    {card.campo ? (
                                        <View style={styles.auxiliaryBlock}>
                                            <Text style={styles.auxiliaryLabel}>{card.campo.label}</Text>
                                            <Text style={styles.auxiliaryText}>{card.campo.value}</Text>
                                        </View>
                                    ) : null}

                                    {card.produtos ? (
                                        <View>
                                            <Text style={styles.sectionTitle}>Produtos</Text>
                                            {card.produtos.map((produto, index) => (
                                                <View key={`${card.id}-produto-${index}`} style={styles.auxiliaryProductBlock}>
                                                    <Text style={styles.auxiliaryProductName}>{produto.nome}</Text>
                                                    <Text style={styles.auxiliaryLabel}>Valor</Text>
                                                    <Text style={styles.auxiliaryProductValue}>{produto.valor}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null}

                                    {card.total ? (
                                        <View style={styles.auxiliaryBlock}>
                                            <Text style={styles.auxiliaryLabel}>Total</Text>
                                            <Text style={styles.auxiliaryText}>{card.total}</Text>
                                        </View>
                                    ) : null}

                                    {card.mensagem ? (
                                        <View style={styles.auxiliaryBlock}>
                                            <Text style={styles.auxiliaryLabel}>Mensagem</Text>
                                            <Text style={styles.auxiliaryText}>{card.mensagem}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    </View>
                </Page>
            ))}
        </Document>
    );
}
