import { Mail } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { CONTATO_EMAIL } from "@/lib/site";

const LINK = "inline-flex min-h-11 items-center text-body text-text hover:text-primary";

export function Rodape() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-h3 text-primary">VetMeet</p>
          <p className="mt-2 text-small text-text-muted">
            Veterinários do Alto Tietê e da Zona Leste de São Paulo.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/buscar" className={LINK}>
                Buscar veterinários
              </Link>
            </li>
            <li>
              <Link href="/sou-veterinario" className={LINK}>
                Sou veterinário
              </Link>
            </li>
            {CONTATO_EMAIL && (
              <li>
                <a href={`mailto:${CONTATO_EMAIL}`} className={`${LINK} gap-2`}>
                  <Icon icon={Mail} />
                  {CONTATO_EMAIL}
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div>
          <p className="text-small font-semibold text-text">Privacidade (LGPD)</p>
          <p className="mt-2 text-small text-pretty text-text-muted">
            Quem procura veterinário não precisa se cadastrar, e não guardamos dados pessoais de tutores.
            Buscas e cliques de contato são registrados de forma anônima, só para medir o uso do site.
            {CONTATO_EMAIL && " Veterinários podem pedir a correção ou remoção dos seus dados pelo e-mail de contato."}
          </p>
        </div>
      </div>
    </footer>
  );
}
