'use client';
import { useState } from "react";
import GetPedidos from "../../actions/pedido-get";
import { Pedido } from "../page";
import CustomSelect from "./customSelect";

const statusOptions = ["Ativo", "Concluído", "Cancelado"];

export type FiltroProps = {
    search : string,
    titulo : string
    setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
};

const FiltroStatus: React.FC<FiltroProps> = ({search, titulo, setPedidos}) => {
    const [selectedStatus, setSelectedStatus] = useState("");

    function filtroStatus(status: string) {
        setSelectedStatus(status);
        GetPedidos().then(pedidos => {
            setPedidos(pedidos.filter((pedido : Pedido) => pedido.status.nome === status && pedido.nomeCliente.includes(search)));
         });
    }

    return (
        <CustomSelect
            id="filtro-status-antigo"
            label={titulo}
            hideLabel
            value={selectedStatus}
            placeholder={titulo}
            options={statusOptions.map((status) => ({
                label: status,
                value: status.toLowerCase().replace(" ", "_"),
            }))}
            onChange={filtroStatus}
        />
    );
}

export { FiltroStatus };
