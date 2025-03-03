import { BarraDeBusca } from "./_components/barraDeBusca";
import { FormPedido } from "./_components/criarPedido";
// import { Pedidos } from "./_components/pedidos";


export default function Home() {

  return (
 
      <div className="max-w-6xl mx-auto">
      <BarraDeBusca />
      <FormPedido />
      </div>
  );
}