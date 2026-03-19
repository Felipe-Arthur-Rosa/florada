"use client";

export type ApiStatusState = {
    isApiOffline: boolean;
    message: string;
    statusCode: number | null;
    errorDetails: string;
};

const defaultState: ApiStatusState = {
    isApiOffline: false,
    message: "",
    statusCode: null,
    errorDetails: "",
};

let apiStatusState: ApiStatusState = defaultState;

const listeners = new Set<(state: ApiStatusState) => void>();

function emitChange() {
    listeners.forEach((listener) => listener(apiStatusState));
}

export function subscribeApiStatus(listener: (state: ApiStatusState) => void) {
    listeners.add(listener);
    listener(apiStatusState);

    return () => {
        listeners.delete(listener);
    };
}

export function setApiOffline(
    message = "O serviço está indisponivel no momento. Tente novamente em instantes, caso ainda esteja indisponivel entre em contato com o moderador.",
    statusCode: number | null = null,
    errorDetails = "",
) {
    apiStatusState = {
        isApiOffline: true,
        message,
        statusCode,
        errorDetails,
    };

    emitChange();
}

export function setApiOnline() {
    if (!apiStatusState.isApiOffline) {
        return;
    }

    apiStatusState = defaultState;
    emitChange();
}

export function hideApiStatus() {
    apiStatusState = defaultState;
    emitChange();
}
