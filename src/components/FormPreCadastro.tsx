"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { enviarPreCadastro, type EstadoPreCadastro } from "@/app/sou-veterinario/actions";
import { BOTAO_PRIMARIO } from "@/components/estilos";
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

const ENTRADA =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-base text-slate-900 focus:border-marca-600 focus:outline-2 focus:outline-marca-600/30 aria-invalid:border-red-500 sm:text-sm";

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

  const props = (campo: CampoPreCadastro) => ({
    "aria-invalid": erros[campo] ? true : undefined,
    "aria-describedby": erros[campo] ? `erro-${campo}` : undefined,
  });

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
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 ring-inset">
          {estado.mensagem}
        </p>
      )}

      <Campo rotulo="Nome completo" htmlFor="nome" erro={erros.nome} campo="nome">
        <input
          id="nome"
          name="nome"
          data-campo="nome"
          autoComplete="name"
          required
          maxLength={120}
          defaultValue={v?.nome}
          className={`${ENTRADA} border-slate-300`}
          {...props("nome")}
        />
      </Campo>

      <div className="grid grid-cols-[1fr_6.5rem] gap-3">
        <Campo rotulo="Número do CRMV" htmlFor="crmv_numero" erro={erros.crmv_numero} campo="crmv_numero">
          <input
            id="crmv_numero"
            name="crmv_numero"
            data-campo="crmv_numero"
            inputMode="numeric"
            autoComplete="off"
            required
            maxLength={9}
            placeholder="Ex.: 12345"
            defaultValue={v?.crmv_numero}
            className={`${ENTRADA} border-slate-300`}
            {...props("crmv_numero")}
          />
        </Campo>
        <Campo rotulo="UF" htmlFor="crmv_uf" erro={erros.crmv_uf} campo="crmv_uf">
          <select
            id="crmv_uf"
            name="crmv_uf"
            data-campo="crmv_uf"
            defaultValue={v?.crmv_uf ?? "SP"}
            className={`${ENTRADA} border-slate-300`}
            {...props("crmv_uf")}
          >
            {UFS.map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-3">
        <Campo rotulo="WhatsApp" htmlFor="whatsapp" erro={erros.whatsapp} campo="whatsapp">
          <input
            id="whatsapp"
            name="whatsapp"
            data-campo="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            placeholder="(11) 98765-4321"
            defaultValue={v ? mascararWhatsApp(v.whatsapp) : undefined}
            onInput={(e) => {
              e.currentTarget.value = mascararWhatsApp(e.currentTarget.value);
            }}
            className={`${ENTRADA} border-slate-300`}
            {...props("whatsapp")}
          />
        </Campo>
        <Campo rotulo="E-mail" htmlFor="email" erro={erros.email} campo="email">
          <input
            id="email"
            name="email"
            data-campo="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            defaultValue={v?.email}
            className={`${ENTRADA} border-slate-300`}
            {...props("email")}
          />
        </Campo>
      </div>

      <Campo rotulo="Cidade ou região onde atende" htmlFor="cidade" erro={erros.cidade} campo="cidade">
        <select
          id="cidade"
          name="cidade"
          data-campo="cidade"
          required
          defaultValue={v?.cidade ?? ""}
          className={`${ENTRADA} border-slate-300`}
          {...props("cidade")}
        >
          <option value="" disabled>
            Selecione
          </option>
          <optgroup label="Alto Tietê">
            {catalogos.regioes
              .filter((r) => r.regiao_macro === "alto_tiete")
              .map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.nome}
                </option>
              ))}
          </optgroup>
          <optgroup label="Zona Leste de São Paulo">
            {catalogos.regioes
              .filter((r) => r.regiao_macro === "zona_leste_sp")
              .map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.nome}
                </option>
              ))}
          </optgroup>
        </select>
      </Campo>

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
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-700">
          <input
            type="checkbox"
            name="consentimento"
            value="sim"
            data-campo="consentimento"
            required
            defaultChecked={v?.consentimento}
            className="mt-0.5 size-5 shrink-0 rounded border-slate-300 accent-marca-700"
            {...props("consentimento")}
          />
          {PUBLICAR_PRE_CADASTRO_DIRETO ? (
            <span>
              Autorizo o VetMeet a publicar meu perfil com nome, CRMV, WhatsApp, cidade, espécies e
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
        <Erro campo="consentimento" texto={erros.consentimento} />
      </div>

      <button type="submit" disabled={enviando} className={`${BOTAO_PRIMARIO} w-full py-3 text-base disabled:opacity-60`}>
        {enviando ? "Enviando..." : PUBLICAR_PRE_CADASTRO_DIRETO ? "Publicar meu perfil" : "Enviar pré-cadastro"}
      </button>
    </form>
  );
}

function Campo({
  rotulo,
  htmlFor,
  erro,
  campo,
  children,
}: {
  rotulo: string;
  htmlFor: string;
  erro?: string;
  campo: CampoPreCadastro;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-800">
        {rotulo}
      </label>
      {children}
      <Erro campo={campo} texto={erro} />
    </div>
  );
}

function Erro({ campo, texto }: { campo: CampoPreCadastro; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={`erro-${campo}`} className="mt-1.5 text-sm text-red-700">
      {texto}
    </p>
  );
}

function Opcoes({
  legenda,
  campo,
  erro,
  itens,
  marcados,
}: {
  legenda: string;
  campo: "especies" | "modalidades";
  erro?: string;
  itens: { slug: string; nome: string }[];
  marcados?: string[];
}) {
  return (
    <fieldset aria-describedby={erro ? `erro-${campo}` : undefined}>
      <legend className="mb-2 text-sm font-medium text-slate-800">{legenda}</legend>
      <div className="flex flex-wrap gap-2">
        {itens.map((item, i) => (
          <label key={item.slug} className="cursor-pointer">
            <input
              type="checkbox"
              name={campo}
              value={item.slug}
              data-campo={i === 0 ? campo : undefined}
              defaultChecked={marcados?.includes(item.slug)}
              className="peer sr-only"
            />
            <span className="inline-block rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 transition-colors peer-checked:border-marca-700 peer-checked:bg-marca-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marca-700">
              {item.nome}
            </span>
          </label>
        ))}
      </div>
      <Erro campo={campo} texto={erro} />
    </fieldset>
  );
}
