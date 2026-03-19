import { setApiOffline, setApiOnline } from "../store/api-status";

function stringifyErrorDetails(data: unknown) {
    if (typeof data === "string") {
        return data;
    }

    if (data == null) {
        return "";
    }

    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return String(data);
    }
}

export async function fetchApi(input: RequestInfo | URL, init?: RequestInit) {
    try {
        const response = await fetch(input, init);

        if (response.ok) {
            setApiOnline();
            return response;
        }

        let errorDetails = "";

        try {
            const errorBody = await response.clone().json();
            errorDetails = stringifyErrorDetails(errorBody);
        } catch {
            try {
                errorDetails = await response.clone().text();
            } catch {
                errorDetails = "";
            }
        }

        const message = response.status >= 500
            ? "O servico esta indisponivel no momento. Tente novamente em instantes."
            : "A API retornou um erro ao processar esta operacao.";

        setApiOffline(message, response.status, errorDetails);
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida ao conectar com a API.";
        setApiOffline(
            "Nao foi possivel conectar com a API. Verifique se ela esta rodando.",
            null,
            message,
        );
        throw error;
    }
}
