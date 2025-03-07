import { PEDIDO_URL } from '../functions/api';

async function GetPedidos() {
    const url = PEDIDO_URL().url;
    console.log(url);
    const response = await (await fetch(url)).json();
    return response;
}

export default GetPedidos;