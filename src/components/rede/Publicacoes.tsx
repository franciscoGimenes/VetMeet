import { Pin } from "lucide-react";
import { CardPost } from "@/components/rede/CardPost";
import { FeedRede } from "@/components/rede/FeedRede";
import { RedeProvider } from "@/components/rede/RedeContexto";
import { ButtonLink, Icon } from "@/components/ui";
import { getFixados, listarPosts } from "@/lib/posts";
import { curtidosPor, getVisitante } from "@/lib/visitante";

// Aba "Publicações" do perfil: até 3 fixadas no topo (portfólio) e depois
// todas, em ordem cronológica.
export async function Publicacoes({ vetId, slug, nome }: { vetId: string; slug: string; nome: string }) {
  const [visitante, fixados, pagina] = await Promise.all([
    getVisitante(),
    getFixados(vetId),
    listarPosts({ local: [] }, null, vetId),
  ]);
  const curtidos = await curtidosPor(visitante, [...fixados, ...pagina.posts].map((p) => p.id));
  const meu = visitante.tipo === "veterinario" && visitante.vetId === vetId;

  return (
    <RedeProvider visitante={visitante}>
      <div className="space-y-6 md:space-y-8">
        {meu && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-sage-100 p-4 sm:p-6">
            <p className="text-small text-text">Fixe até 3 publicações para elas aparecerem primeiro aqui.</p>
            <ButtonLink href="/rede/novo">Nova publicação</ButtonLink>
          </div>
        )}
        {fixados.length > 0 && (
          <section aria-labelledby={`${slug}-fixadas`} className="space-y-4 md:space-y-6">
            <h2 id={`${slug}-fixadas`} className="flex items-center gap-3 text-h3 text-text">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-accent-soft text-accent-strong">
                <Icon icon={Pin} size="sm" />
              </span>
              Em destaque
            </h2>
            {fixados.map((p) => (
              <CardPost key={p.id} post={p} curtido={curtidos.includes(p.id)} />
            ))}
          </section>
        )}
        <section aria-labelledby={fixados.length > 0 ? `${slug}-todas` : undefined} className="space-y-4 md:space-y-6">
          {fixados.length > 0 && (
            <h2 id={`${slug}-todas`} className="text-h3 text-text">
              Todas as publicações
            </h2>
          )}
          <FeedRede
            posts={pagina.posts}
            proximo={pagina.proximo}
            curtidos={curtidos}
            filtros={{ local: [] }}
            autor={vetId}
            vazio={
              <div className="rounded-card bg-sage-100 p-6 text-center">
                <p className="text-body text-text">
                  {meu ? "Você ainda não publicou na Rede." : `${nome} ainda não publicou na Rede.`}
                </p>
              </div>
            }
          />
        </section>
      </div>
    </RedeProvider>
  );
}
