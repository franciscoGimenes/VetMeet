import { ButtonLink } from "@/components/ui";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-h1 text-text">Página não encontrada</h1>
      <p className="mt-2 text-body text-text-muted">O perfil pode ter sido desativado ou o endereço está incorreto.</p>
      <ButtonLink href="/buscar" className="mt-6">
        Buscar veterinários
      </ButtonLink>
    </div>
  );
}
