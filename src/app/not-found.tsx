import Link from "next/link";
import { BOTAO_PRIMARIO } from "@/components/estilos";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="mt-2 text-slate-600">O perfil pode ter sido desativado ou o endereço está incorreto.</p>
      <Link href="/buscar" className={`${BOTAO_PRIMARIO} mt-6`}>
        Buscar veterinários
      </Link>
    </div>
  );
}
