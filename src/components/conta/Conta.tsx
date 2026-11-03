"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { useActionState, useId, useRef, useState } from "react";
import {
  definirSenha,
  excluirConta,
  registrarAceite,
  salvarFoto,
  type EstadoAceite,
  type EstadoExclusao,
  type EstadoSenha,
} from "@/app/conta/actions";
import { Avatar } from "@/components/Avatar";
import { Aceite, Alerta } from "@/components/conta/FormsAuth";
import { Button, Field, Icon, Input } from "@/components/ui";
import { SENHA_MIN } from "@/lib/senha";
import { createClient } from "@/lib/supabase/client";
import { DECLARACAO_CRMV } from "@/lib/termos";

const linkTexto = "font-medium text-primary underline underline-offset-4";

export function FormAceite() {
  const [estado, acao, enviando] = useActionState<EstadoAceite, FormData>(registrarAceite, {});
  return (
    <form action={acao} noValidate className="space-y-4">
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <Aceite name="declaracao" erro={estado.erros?.declaracao}>
        {DECLARACAO_CRMV}
      </Aceite>
      <Aceite name="termos" erro={estado.erros?.termos}>
        Li e aceito os{" "}
        <Link href="/termos" target="_blank" className={linkTexto}>
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" target="_blank" className={linkTexto}>
          Política de Privacidade
        </Link>
        .
      </Aceite>
      <Button type="submit" size="lg" block disabled={enviando}>
        {enviando ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
}

// Recorta no centro, reduz para 640px e reencoda: a foto sai leve e sem os
// metadados do arquivo original (EXIF, inclusive localização).
async function prepararFoto(arquivo: File) {
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const lado = Math.min(bitmap.width, bitmap.height);
  const alvo = Math.min(640, lado);
  const canvas = document.createElement("canvas");
  canvas.width = alvo;
  canvas.height = alvo;
  canvas
    .getContext("2d")!
    .drawImage(bitmap, (bitmap.width - lado) / 2, (bitmap.height - lado) / 2, lado, lado, 0, 0, alvo, alvo);
  bitmap.close();
  const gerar = (tipo: string) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, 0.85));
  // Safari não gera WebP no canvas (devolve PNG): nesse caso vai JPEG.
  const webp = await gerar("image/webp");
  const blob = webp?.type === "image/webp" ? webp : await gerar("image/jpeg");
  if (!blob) throw new Error("não foi possível processar a imagem");
  return blob;
}

export function FotoPerfil({ nome, fotoUrl, userId }: { nome: string; fotoUrl: string | null; userId: string }) {
  const [url, setUrl] = useState(fotoUrl);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  async function enviar(arquivo: File) {
    setErro(null);
    if (!arquivo.type.startsWith("image/")) return setErro("Escolha uma imagem (JPG, PNG ou WebP).");
    if (arquivo.size > 20 * 1024 * 1024) return setErro("A imagem passa de 20 MB. Escolha uma menor.");
    setEnviando(true);
    try {
      const blob = await prepararFoto(arquivo);
      const extensao = blob.type === "image/webp" ? "webp" : "jpg";
      const caminho = `${userId}/${Date.now()}.${extensao}`;
      const { error } = await createClient()
        .storage.from("fotos-veterinarios")
        .upload(caminho, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (error) throw error;
      const r = await salvarFoto(caminho);
      if ("erro" in r) throw new Error(r.erro);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      setErro("Não foi possível enviar a foto. Tente outra imagem ou tente de novo.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remover() {
    setEnviando(true);
    const r = await salvarFoto(null);
    setEnviando(false);
    if ("erro" in r) setErro("Não foi possível remover a foto agora.");
    else setUrl(null);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar nome={nome} fotoUrl={url} tamanho="lg" />
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="peer sr-only"
            disabled={enviando}
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) enviar(arquivo);
            }}
          />
          <label
            htmlFor={id}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-border-strong bg-surface px-4 text-body text-text hover:bg-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
          >
            <Icon icon={Camera} />
            {enviando ? "Enviando..." : url ? "Trocar foto" : "Adicionar foto"}
          </label>
          {url && !enviando && (
            <Button variant="ghost" onClick={remover}>
              Remover
            </Button>
          )}
        </div>
        {erro && (
          <p role="alert" className="text-small text-error-strong">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}

export function FormNovaSenha() {
  const [estado, acao, enviando] = useActionState<EstadoSenha, FormData>(definirSenha, {});
  const id = useId();
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <Field id={`${id}-senha`} label="Nova senha" hint={`Pelo menos ${SENHA_MIN} caracteres.`}>
        <Input
          id={`${id}-senha`}
          aria-describedby={`${id}-senha-dica`}
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={SENHA_MIN}
        />
      </Field>
      <Field id={`${id}-confirmacao`} label="Repita a nova senha">
        <Input id={`${id}-confirmacao`} name="confirmacao" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" block disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}

export function ExcluirConta() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState<EstadoExclusao, FormData>(excluirConta, {});
  const id = useId();

  if (!aberto) {
    return (
      <Button variant="danger" onClick={() => setAberto(true)}>
        Excluir minha conta
      </Button>
    );
  }

  return (
    <form action={acao} className="space-y-4 rounded-card bg-error/10 p-4">
      <p className="text-small text-text">
        Isto apaga sua conta, seu perfil, a foto e o pré-cadastro, se houver. O perfil sai do ar na hora e
        <strong className="font-semibold"> não dá para desfazer</strong>. Se quiser só sair da busca por um tempo,
        use “Pausar perfil”.
      </p>
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <Field id={`${id}-confirmacao`} label="Digite EXCLUIR para confirmar">
        <Input id={`${id}-confirmacao`} name="confirmacao" autoComplete="off" autoCapitalize="characters" required />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" disabled={enviando}>
          {enviando ? "Excluindo..." : "Excluir conta e dados"}
        </Button>
        <Button variant="ghost" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
