"use client";

import { ArrowLeft, ArrowRight, CircleAlert, ImagePlus, X } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";
import { salvarPost, type EstadoPost } from "@/app/rede/actions";
import { Alerta, Button, Chip, CONTROLE, ErroCampo, Icon } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { cn } from "@/lib/cn";
import { prepararImagem, TAMANHO_ORIGINAL_MAX } from "@/lib/imagem";
import { BUCKET_REDE, CATEGORIAS, FOTOS_MAX, TEXTO_MAX, validarPost, type ErrosPost, type FotoPost } from "@/lib/rede";
import { createClient } from "@/lib/supabase/client";
import { irParaErro, useMostrarErro } from "@/lib/useMostrarErro";

// Lado maior das fotos da Rede depois do envio.
const LADO_FOTO = 1600;

export type PostEditavel = {
  id: string;
  categoria: string;
  texto: string;
  fotos: FotoPost[];
  especies: string[];
  servicos: string[];
};

type FotoForm = FotoPost & { chave: string };

export function FormPost({
  catalogos,
  userId,
  post,
}: {
  catalogos: Catalogos;
  userId: string;
  post?: PostEditavel;
}) {
  const [estado, acao, salvando] = useActionState<EstadoPost, FormData>(salvarPost, {});
  const [errosLocais, setErrosLocais] = useState<ErrosPost>({});
  const [texto, setTexto] = useState(post?.texto ?? "");
  const [fotos, setFotos] = useState<FotoForm[]>(() => (post?.fotos ?? []).map((f) => ({ ...f, chave: f.caminho })));
  const [enviando, setEnviando] = useState(0);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);
  const id = useId();
  const erros = { ...estado.erros, ...errosLocais };
  const formRef = useRef<HTMLFormElement>(null);
  useMostrarErro(estado, formRef);
  const resumoErro = estado.erro ?? Object.values(erros).find(Boolean) ?? null;

  async function adicionar(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setErroFoto(null);
    const vagas = FOTOS_MAX - fotos.length - enviando;
    const lista = Array.from(arquivos).slice(0, Math.max(0, vagas));
    if (arquivos.length > lista.length) setErroFoto(`No máximo ${FOTOS_MAX} fotos por publicação.`);
    setEnviando((n) => n + lista.length);
    const supabase = createClient();
    for (const arquivo of lista) {
      try {
        if (!arquivo.type.startsWith("image/")) throw new Error("tipo");
        if (arquivo.size > TAMANHO_ORIGINAL_MAX) throw new Error("tamanho");
        // Reduz, converte para WebP e sai sem EXIF (inclusive GPS).
        const img = await prepararImagem(arquivo, { lado: LADO_FOTO });
        const caminho = `${userId}/${crypto.randomUUID()}.${img.extensao}`;
        const { error } = await supabase.storage
          .from(BUCKET_REDE)
          .upload(caminho, img.blob, { contentType: img.blob.type, cacheControl: "31536000" });
        if (error) throw error;
        const novo = { caminho, chave: caminho, url: URL.createObjectURL(img.blob), largura: img.largura, altura: img.altura };
        setFotos((f) => [...f, novo]);
      } catch (e) {
        console.error(e);
        setErroFoto(
          e instanceof Error && e.message === "tamanho"
            ? "Uma das imagens passa de 20 MB. Escolha uma menor."
            : "Não foi possível enviar uma das fotos. Tente outra imagem ou tente de novo.",
        );
      } finally {
        setEnviando((n) => n - 1);
      }
    }
    if (inputFoto.current) inputFoto.current.value = "";
  }

  function mover(i: number, passo: number) {
    setFotos((f) => {
      const nova = [...f];
      const [item] = nova.splice(i, 1);
      nova.splice(i + passo, 0, item);
      return nova;
    });
  }

  const dadosFotos = JSON.stringify(fotos.map(({ caminho, largura, altura }) => ({ caminho, largura, altura })));

  return (
    <form
      ref={formRef}
      action={acao}
      noValidate
      onSubmit={(e) => {
        const d = new FormData(e.currentTarget);
        const local = validarPost({
          categoria: String(d.get("categoria") ?? ""),
          texto,
          fotos: [],
          especies: [],
          servicos: [],
        });
        setErrosLocais(local);
        if (Object.keys(local).length || enviando) e.preventDefault();
        if (Object.keys(local).length) requestAnimationFrame(() => irParaErro(formRef.current));
      }}
      className="space-y-6 md:space-y-8"
    >
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="fotos" value={dadosFotos} />
      {estado.erro && <Alerta>{estado.erro}</Alerta>}

      <fieldset aria-describedby={erros.categoria ? `${id}-cat-erro` : undefined}>
        <legend className="mb-2 text-body font-semibold text-text">Categoria</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Chip key={c.valor} type="radio" name="categoria" value={c.valor} defaultChecked={post?.categoria === c.valor}>
              {c.nome}
            </Chip>
          ))}
        </div>
        {erros.categoria && (
          <ErroCampo id={`${id}-cat-erro`} className="mt-2">{erros.categoria}</ErroCampo>
        )}
      </fieldset>

      <div>
        <label htmlFor={`${id}-texto`} className="mb-2 block text-body font-semibold text-text">
          Texto
        </label>
        <textarea
          id={`${id}-texto`}
          name="texto"
          rows={10}
          maxLength={TEXTO_MAX}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-invalid={erros.texto ? true : undefined}
          aria-describedby={`${id}-texto-info`}
          className={cn(CONTROLE, "py-2")}
        />
        <div id={`${id}-texto-info`} className="mt-1.5 flex justify-between gap-2 text-small">
          {erros.texto ? (
            <ErroCampo className="mt-0">{erros.texto}</ErroCampo>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-text-muted">
            {texto.length.toLocaleString("pt-BR")}/{TEXTO_MAX.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      <section aria-labelledby={`${id}-fotos`}>
        <h2 id={`${id}-fotos`} className="text-body font-semibold text-text">
          Fotos <span className="font-normal text-text-muted">(opcional, até {FOTOS_MAX})</span>
        </h2>
        <p className="mt-1 text-small text-text-muted">
          As fotos são reduzidas e enviadas sem os dados do arquivo, como a localização.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((f, i) => (
            <li key={f.chave} className="overflow-hidden rounded-control border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element -- prévia local (blob) ou do Storage */}
              <img src={f.url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
              <div className="flex justify-between">
                <Button variant="ghost" iconOnly disabled={i === 0} onClick={() => mover(i, -1)} aria-label={`Mover foto ${i + 1} para antes`}>
                  <Icon icon={ArrowLeft} />
                </Button>
                <Button
                  variant="ghost"
                  iconOnly
                  onClick={() => setFotos((l) => l.filter((x) => x.chave !== f.chave))}
                  aria-label={`Remover foto ${i + 1}`}
                  className="text-error-strong"
                >
                  <Icon icon={X} />
                </Button>
                <Button
                  variant="ghost"
                  iconOnly
                  disabled={i === fotos.length - 1}
                  onClick={() => mover(i, 1)}
                  aria-label={`Mover foto ${i + 1} para depois`}
                >
                  <Icon icon={ArrowRight} />
                </Button>
              </div>
            </li>
          ))}
          {Array.from({ length: enviando }, (_, i) => (
            <li key={`enviando-${i}`} className="grid aspect-square animate-pulse place-items-center rounded-control bg-sage-100 text-small text-text-muted">
              Enviando...
            </li>
          ))}
        </ul>
        {fotos.length + enviando < FOTOS_MAX && (
          <div className="mt-3">
            <input
              ref={inputFoto}
              id={`${id}-arquivo`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              className="peer sr-only"
              onChange={(e) => adicionar(e.target.files)}
            />
            <label
              htmlFor={`${id}-arquivo`}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-border-strong bg-surface px-4 text-body font-semibold text-text hover:bg-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
            >
              <Icon icon={ImagePlus} /> Adicionar fotos
            </label>
          </div>
        )}
        {(erroFoto || erros.fotos) && <ErroCampo className="mt-2">{erroFoto ?? erros.fotos}</ErroCampo>}
      </section>

      <fieldset>
        <legend className="text-body font-semibold text-text">
          Espécies <span className="font-normal text-text-muted">(opcional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {catalogos.especies.map((e) => (
            <Chip key={e.slug} name="especies" value={e.slug} defaultChecked={post?.especies.includes(e.slug)}>
              {e.nome}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-body font-semibold text-text">
          Serviços <span className="font-normal text-text-muted">(opcional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {catalogos.servicos.map((s) => (
            <Chip key={s.slug} name="servicos" value={s.slug} defaultChecked={post?.servicos.includes(s.slug)}>
              {s.nome}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-border bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        {resumoErro && !salvando && (
          <p className="mb-3 flex gap-1.5 text-small text-error-strong">
            <Icon icon={CircleAlert} size="sm" className="mt-0.5" />
            <span className="min-w-0">
              <span className="font-semibold">{post ? "Alterações não salvas." : "Não publicado."}</span> {resumoErro}
            </span>
          </p>
        )}
        <Button type="submit" size="lg" block disabled={salvando || enviando > 0} className="sm:w-auto">
          {enviando > 0 ? "Enviando fotos..." : salvando ? "Salvando..." : post ? "Salvar alterações" : "Publicar"}
        </Button>
      </div>
    </form>
  );
}
