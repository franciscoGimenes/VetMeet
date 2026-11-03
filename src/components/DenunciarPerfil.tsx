"use client";

import { Flag } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";
import { enviarDenuncia, type EstadoDenuncia } from "@/app/vet/[slug]/actions";
import { Alerta } from "@/components/conta/FormsAuth";
import { Button, Field, Icon, OptionRow } from "@/components/ui";
import { CAMPO_HONEYPOT, DESCRICAO_DENUNCIA_MAX, MOTIVOS_DENUNCIA } from "@/lib/denuncia";

// Botão discreto no fim do perfil; abre o formulário ali mesmo. Sem login.
export function DenunciarPerfil({ vetId }: { vetId: string }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState<EstadoDenuncia, FormData>(enviarDenuncia, {});
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  if (estado.enviado) {
    return (
      <Alerta tom="ok">
        Denúncia enviada. A equipe do VetMeet vai analisar o perfil. Obrigado por avisar.
      </Alerta>
    );
  }

  if (!aberto) {
    return (
      <Button
        variant="ghost"
        className="-ml-4 text-text-muted"
        onClick={() => {
          setAberto(true);
          requestAnimationFrame(() => formRef.current?.querySelector("input")?.focus());
        }}
      >
        <Icon icon={Flag} />
        Denunciar perfil
      </Button>
    );
  }

  return (
    <form ref={formRef} action={acao} className="space-y-4 rounded-card border border-border bg-surface p-4 sm:p-6">
      <h2 className="text-h3 text-text">Denunciar perfil</h2>
      <input type="hidden" name="veterinarian_id" value={vetId} />
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <fieldset aria-describedby={estado.erroMotivo ? `${id}-motivo-erro` : undefined}>
        <legend className="mb-2 text-small font-medium text-text">Motivo</legend>
        <div className="space-y-2">
          {MOTIVOS_DENUNCIA.map((m) => (
            <OptionRow key={m.slug} type="radio" name="motivo" value={m.slug}>
              {m.nome}
            </OptionRow>
          ))}
        </div>
        {estado.erroMotivo && (
          <p id={`${id}-motivo-erro`} className="mt-1.5 text-small text-error-strong">
            {estado.erroMotivo}
          </p>
        )}
      </fieldset>
      <Field
        id={`${id}-descricao`}
        label="O que aconteceu? (opcional)"
        hint="Não precisa se identificar. Evite colocar seus dados pessoais."
      >
        <textarea
          id={`${id}-descricao`}
          aria-describedby={`${id}-descricao-dica`}
          name="descricao"
          rows={4}
          maxLength={DESCRICAO_DENUNCIA_MAX}
          className="block min-h-11 w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-body text-text placeholder:text-text-muted focus-visible:border-primary"
        />
      </Field>
      {/* Armadilha para robôs: fora da tela e fora da navegação por teclado */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${id}-${CAMPO_HONEYPOT}`}>Não preencha este campo</label>
        <input id={`${id}-${CAMPO_HONEYPOT}`} name={CAMPO_HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar denúncia"}
        </Button>
        <Button variant="ghost" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
