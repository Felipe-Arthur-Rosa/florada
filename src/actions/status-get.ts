import { Status } from '@/app/page';
import { STATUS_URL } from '../functions/api';

export let status : Status[] = [];

async function GetStatus() {
    const url = STATUS_URL().url;
    status = await(await fetch(url)).json();
    console.log("buscou status:" + status);
}

export default GetStatus;