"use client";

import { useActionState, useRef, useState } from "react";
import { enviarPreCadastro, type EstadoPreCadastro } from "@/app/sou-veterinario/actions";
import { Button, Chip, Field, Input, Select, fieldProps } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { PUBLICAR_PRE_CADASTRO_DIRETO } from "@/lib/mvp";
import {
  CAMPO_HONEYPOT,
  lerFormulario,
  mascararWhatsApp,
  UFS,
  validarPreCadastro,
  type CampoPreCadastro,
  type ErrosPreCadastro,
} from "@/lib/precadastro";

export function FormPreCadastro({ catalogos }: { catalogos: Catalogos }) {
  const [estado, acao, enviando] = useActionState<EstadoPreCadastro, FormData>(enviarPreCadastro, {});
  const [errosCliente, setErrosCliente] = useState<ErrosPreCadastro | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const permitidos = {
    cidades: catalogos.regioes.map((r) => r.slug),
    especies: catalogos.especies.map((e) => e.slug),
    modalidades: catalogos.modos.map((m) => m.slug),
  };
  const erros = errosCliente ?? estado.erros ?? {};
  const v = estado.valores;

  function validar() {
    if (!formRef.current) return null;
    const r = validarPreCadastro(lerFormulario(new FormData(formRef.current)), permitidos);
    return r.ok ? {} : r.erros;
  }

  // Depois da primeira tentativa, a mensagem some assim que o campo é corrigido.
  function revalidar() {
    if (errosCliente) setErrosCliente(validar());
  }

  const campo = (nome: CampoPreCadastro) => ({ ...fieldProps(nome, { error: erros[nome] }), "data-campo": nome });

  return (
    <form
      ref={formRef}
      action={acao}
      noValidate
      onSubmit={(e) => {
        const encontrados = validar() ?? {};
        setErrosCliente(encontrados);
        if (Object.keys(encontrados).length) {
          e.preventDefault();
          const primeiro = Object.keys(encontrados)[0];
          formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro}"]`)?.focus();
        }
      }}
      onChange={revalidar}
      className="space-y-6"
    >
      {estado.mensagem && (
        <p role="alert" className="rounded-control bg-error/10 px-4 py-3 text-small text-error-strong ring-1 ring-error/30 ring-inset">
          {estado.mensagem}
        </p>
      )}

      <Field id="nome" label="Nome completo" error={erros.nome}>
        <Input {...campo("nome")} name="nome" autoComplete="name" required maxLength={120} defaultValue={v?.nome} />
      </Field>

      <div className="grid grid-cols-[1fr_6.5rem] gap-3">
        <Field id="crmv_numero" label="Número do CRMV" error={erros.crmv_numero}>
          <Input
            {...campo("crmv_numero")}
            name="crmv_numero"
            inputMode="numeric"
            autoComplete="off"
            required
            maxLength={9}
            placeholder="Ex.: 12345"
            defaultValue={v?.crmv_numero}
          />
        </Field>
        <Field id="crmv_uf" label="UF" error={erros.crmv_uf}>
          <Select {...campo("crmv_uf")} name="crmv_uf" defaultValue={v?.crmv_uf ?? "SP"}>
            {UFS.map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-3">
        <Field id="whatsapp" label="WhatsApp" error={erros.whatsapp}>
          <Input
            {...campo("whatsapp")}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            placeholder="(11) 98765-4321"
            defaultValue={v ? mascararWhatsApp(v.whatsapp) : undefined}
            onInput={(e) => {
              e.currentTarget.value = mascararWhatsApp(e.currentTarget.value);
            }}
          />
        </Field>
        <Field id="email" label="E-mail" error={erros.email}>
          <Input
            {...campo("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            defaultValue={v?.email}
          />
        </Field>
      </div>

      <Opcoes
        legenda="Cidades ou regiões onde atende"
        campo="regioes"
        erro={erros.regioes}
        grupos={[
          { rotulo: "Alto Tietê", itens: catalogos.regioes.filter((r) => r.regiao_macro === "alto_tiete") },
          {
            rotulo: "Zona Leste de São Paulo",
            itens: catalogos.regioes.filter((r) => r.regiao_macro === "zona_leste_sp"),
          },
        ]}
        marcados={v?.regioes}
      />

      <Opcoes
        legenda="Espécies que atende"
        campo="especies"
        erro={erros.especies}
        itens={catalogos.especies.map((e) => ({ ...e, nome: e.slug === "exoticos" ? "Exóticos" : e.nome }))}
        marcados={v?.especies}
      />

      <Opcoes
        legenda="Modalidades de atendimento"
        campo="modalidades"
        erro={erros.modalidades}
        itens={catalogos.modos}
        marcados={v?.modalidades}
      />

      {/* Armadilha para robôs: fora da tela e fora da navegação por teclado */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={CAMPO_HONEYPOT}>Não preencha este campo</label>
        <input id={CAMPO_HONEYPOT} name={CAMPO_HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-small text-text">
          <input
            type="checkbox"
            name="consentimento"
            value="sim"
            required
            defaultChecked={v?.consentimento}
            className="mt-0.5 size-5 shrink-0 rounded-mark border-border-strong accent-primary"
            {...campo("consentimento")}
          />
          {PUBLICAR_PRE_CADASTRO_DIRETO ? (
            <span>
              Autorizo o VetMeet a publicar meu perfil com nome, CRMV, WhatsApp, cidades, espécies e
              modalidades, e a guardar meu e-mail (que não aparece no site) para contato, conforme a LGPD.
              Posso pedir a retirada do perfil e a exclusão dos dados a qualquer momento.
            </span>
          ) : (
            <span>
              Autorizo o VetMeet a guardar estes dados para entrar em contato comigo sobre o cadastro na
              plataforma, conforme a LGPD. Posso pedir a exclusão a qualquer momento respondendo a uma de
              nossas mensagens.
            </span>
          )}
        </label>
        {erros.consentimento && (
          <p id="consentimento-erro" className="mt-1.5 text-small text-error-strong">
            {erros.consentimento}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" block disabled={enviando}>
        {enviando ? "Enviando..." : PUBLICAR_PRE_CADASTRO_DIRETO ? "Publicar meu perfil" : "Enviar pré-cadastro"}
      </Button>
    </form>
  );
}

type ItemOpcao = { slug: string; nome: string };

// Chips de múltipla escolha; com `grupos`, cada grupo ganha um subtítulo.
function Opcoes({
  legenda,
  campo,
  erro,
  itens,
  grupos,
  marcados,
}: {
  legenda: string;
  campo: "especies" | "modalidades" | "regioes";
  erro?: string;
  itens?: ItemOpcao[];
  grupos?: { rotulo: string; itens: ItemOpcao[] }[];
  marcados?: string[];
}) {
  const blocos = grupos ?? [{ rotulo: "", itens: itens ?? [] }];
  const primeiro = blocos[0]?.itens[0]?.slug;
  return (
    <fieldset aria-describedby={erro ? `${campo}-erro` : undefined}>
      <legend className="mb-2 text-small font-medium text-text">{legenda}</legend>
      <div className="space-y-3">
        {blocos.map((b) => (
          <div key={b.rotulo}>
            {b.rotulo && <p className="mb-2 text-caption font-semibold text-text-muted">{b.rotulo}</p>}
            <div className="flex flex-wrap gap-2">
              {b.itens.map((item) => (
                <Chip
                  key={item.slug}
                  name={campo}
                  value={item.slug}
                  defaultChecked={marcados?.includes(item.slug)}
                  dataCampo={item.slug === primeiro ? campo : undefined}
                >
                  {item.nome}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
      {erro && (
        <p id={`${campo}-erro`} className="mt-1.5 text-small text-error-strong">
          {erro}
        </p>
      )}
    </fieldset>
  );
}
