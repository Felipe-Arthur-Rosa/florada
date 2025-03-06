export const API_URL = "https://api-florada.vercel.app";

export function PEDIDO_URL (id : string = '') {
    if(id === '') {
    return {
        url: `${API_URL}/pedido`,
        }
    } 
    return {
        url: `${API_URL}/pedido/${id}`,
    }   
}

export function STATUS_URL () {
    return {
        url: `${API_URL}/status`,
        }    
}