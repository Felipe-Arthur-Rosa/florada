"use client";

import { useEffect, useState } from "react";
import { ApiStatusState, hideApiStatus, subscribeApiStatus } from "../store/api-status";

const initialState: ApiStatusState = {
    isApiOffline: false,
    message: "",
    statusCode: null,
    errorDetails: "",
};

export default function ApiStatusPopup() {
    const [apiStatus, setApiStatus] = useState<ApiStatusState>(initialState);

    useEffect(() => {
        return subscribeApiStatus(setApiStatus);
    }, []);

    if (!apiStatus.isApiOffline) {
        return null;
    }

    const popupTitle = apiStatus.statusCode && apiStatus.statusCode < 500
        ? "Erro retornado pela API"
        : "Falha de conexao com a API";

    return (
        <div className="fixed right-4 top-20 z-[100] w-[calc(100%-2rem)] max-w-md rounded-lg border border-destructive/30 bg-destructive/10 p-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-destructive">{popupTitle}</h2>
                    <p className="mt-1 text-sm text-destructive">{apiStatus.message}</p>
                    <div className="mt-3 rounded border border-destructive/20 bg-card p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Detalhes tecnicos</p>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">
{`statusCode: ${apiStatus.statusCode ?? "sem resposta"}
error: ${apiStatus.errorDetails || "sem detalhes retornados pela API"}`}
                        </pre>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={hideApiStatus}
                    className="rounded px-2 py-1 text-sm text-destructive transition hover:bg-destructive/10"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
