"use client";

import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { useActionState, useId, useRef, useState, type ReactNode } from "react";
import { salvarPerfil, type EstadoPerfil } from "@/app/conta/actions";
import { Alerta, Button, Card, Chip, ErroCampo, Field, Icon, Input, Select, fieldProps } from "@/components/ui";
import type { Catalogos } from "@/lib/catalogos";
import { UFS } from "@/lib/crmv";
import {
  BIO_MAX,
  DISPONIBILIDADE_PERFIL,
  lerFormularioPerfil,
  validarPerfil,
  type CampoPerfil,
  type DadosPerfil,
  type ErrosPerfil,
  type LocalForm,
} from "@/lib/perfil";
import { useMostrarErro } from "@/lib/useMostrarErro";
import { mascararWhatsApp } from "@/lib/whatsapp";

type LocalComChave = LocalForm & { chave: number };
const LOCAL_VAZIO: LocalForm = { nome: "", endereco: "", regiao: "", bairro: "" };

export function FormPerfil({
  catalogos,
  inicial,
  novo,
}: {
  catalogos: Catalogos;
  inicial: DadosPerfil;
  novo: boolean;
}) {
  const [estado, acao, enviando] = useActionState<EstadoPerfil, FormData>(salvarPerfil, {});
  const [errosCliente, setErrosCliente] = useState<ErrosPerfil | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  const v = estado.valores ?? inicial;
  // A validação do navegador só vale quando achou algo: vazia, ela escondia os
  // erros que só o servidor conhece (ex.: CRMV já usado em outro perfil).
  const erros = (errosCliente && Object.keys(errosCliente).length ? errosCliente : estado.erros) ?? {};
  useMostrarErro(estado, formRef);

  // O que muda a forma do formulário (campos que aparecem ou somem).
  const [sel, setSel] = useState(() => ({
    modos: v.modos,
    servicos: v.servicos,
    pagamentos: v.pagamentos,
    areas: v.areas,
  }));
  const [locais, setLocais] = useState<LocalComChave[]>(() =>
    (v.locais.length ? v.locais : [LOCAL_VAZIO]).map((l, i) => ({ ...l, chave: i })),
  );
  const [bio, setBio] = useState(v.bio.length);

  function validar() {
    if (!formRef.current) return {};
    const r = validarPerfil(lerFormularioPerfil(new FormData(formRef.current)), catalogos);
    return r.ok ? {} : r.erros;
  }

  function aoMudar() {
    if (!formRef.current) return;
    const f = new FormData(formRef.current);
    const lista = (k: string) => f.getAll(k).map(String);
    setSel({ modos: lista("modos"), servicos: lista("servicos"), pagamentos: lista("pagamentos"), areas: lista("areas") });
    // Depois da primeira tentativa, a mensagem some assim que o campo é corrigido.
    if (errosCliente) setErrosCliente(validar());
  }

  const campo = (nome: CampoPerfil, hint?: string) => ({
    ...fieldProps(`${id}-${nome}`, { error: erros[nome], hint }),
    "data-campo": nome,
  });

  const alterarLocal = (chave: number, mudanca: Partial<LocalForm>) =>
    setLocais((ls) => ls.map((l) => (l.chave === chave ? { ...l, ...mudanca } : l)));

  const temErro = Object.keys(erros).length > 0;
  const resumoErro = estado.erro ?? (temErro ? Object.values(erros)[0] : null);
  const alto = catalogos.regioes.filter((r) => r.regiao_macro === "alto_tiete");
  const leste = catalogos.regioes.filter((r) => r.regiao_macro === "zona_leste_sp");
  const areasEscolhidas = catalogos.areas.filter((a) => sel.areas.includes(a.slug));

  return (
    <form
      ref={formRef}
      action={acao}
      noValidate
      onChange={aoMudar}
      onSubmit={(e) => {
        const encontrados = validar();
        setErrosCliente(encontrados);
        if (Object.keys(encontrados).length) {
          e.preventDefault();
          const primeiro = Object.keys(encontrados)[0];
          formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro}"]`)?.focus();
        }
      }}
      className="space-y-6 md:space-y-8"
    >
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      {temErro && <Alerta>Confira os campos marcados abaixo.</Alerta>}

      <Bloco titulo="Identificação">
        <Field id={`${id}-nome`} label="Nome no perfil" error={erros.nome} hint="Como tutores vão ver, ex.: Dra. Ana Souza.">
          <Input {...campo("nome", "sim")} name="nome" autoComplete="name" maxLength={120} defaultValue={v.nome} />
        </Field>
        <div className="grid grid-cols-[1fr_6.5rem] gap-3">
          <Field id={`${id}-crmv_numero`} label="Número do CRMV" error={erros.crmv_numero}>
            <Input
              {...campo("crmv_numero")}
              name="crmv_numero"
              autoComplete="off"
              maxLength={10}
              placeholder="Ex.: 12345"
              defaultValue={v.crmv_numero}
            />
          </Field>
          <Field id={`${id}-crmv_uf`} label="UF" error={erros.crmv_uf}>
            <Select {...campo("crmv_uf")} name="crmv_uf" defaultValue={v.crmv_uf || "SP"}>
              {UFS.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </Select>
          </Field>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-small text-text">
          <input
            type="checkbox"
            name="crmv_secundaria"
            value="sim"
            defaultChecked={v.crmv_secundaria}
            className="size-5 shrink-0 rounded-mark border-border-strong accent-primary"
          />
          Inscrição secundária (aparece como “nº 12345-S”)
        </label>
      </Bloco>

      <Bloco titulo="Contato">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-3">
          <Field id={`${id}-whatsapp`} label="WhatsApp" error={erros.whatsapp}>
            <Input
              {...campo("whatsapp")}
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(11) 98765-4321"
              defaultValue={v.whatsapp}
              onInput={(e) => {
                e.currentTarget.value = mascararWhatsApp(e.currentTarget.value);
              }}
            />
          </Field>
          <Field id={`${id}-instagram`} label="Instagram (opcional)" error={erros.instagram}>
            <Input
              {...campo("instagram")}
              name="instagram"
              autoComplete="off"
              autoCapitalize="none"
              placeholder="@seu.perfil"
              maxLength={60}
              defaultValue={v.instagram}
            />
          </Field>
        </div>
      </Bloco>

      <Bloco titulo="Como atende">
        <Opcoes legenda="Formas de atendimento" campo="modos" erro={erros.modos} itens={catalogos.modos} marcados={v.modos} />

        <div hidden={!sel.modos.includes("clinica_propria")} className="space-y-4">
          <p className="text-small font-medium text-text" data-campo="locais" tabIndex={-1}>
            Locais de atendimento
          </p>
          {locais.map((l, i) => {
            const regiao = catalogos.regioes.find((r) => r.slug === l.regiao);
            const bairros = regiao ? catalogos.bairros.filter((b) => b.region_id === regiao.id) : [];
            const pre = `${id}-local-${l.chave}`;
            return (
              <fieldset key={l.chave} className="space-y-4 rounded-card bg-background p-4">
                <legend className="sr-only">Local {i + 1}</legend>
                <Field id={`${pre}-nome`} label="Nome do local">
                  <Input
                    id={`${pre}-nome`}
                    name="local_nome"
                    maxLength={120}
                    placeholder="Ex.: Consultório Vila Oliveira"
                    value={l.nome}
                    onChange={(e) => alterarLocal(l.chave, { nome: e.target.value })}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
                  <Field id={`${pre}-regiao`} label="Cidade ou região">
                    <Select
                      id={`${pre}-regiao`}
                      name="local_regiao"
                      value={l.regiao}
                      onChange={(e) => alterarLocal(l.chave, { regiao: e.target.value, bairro: "" })}
                    >
                      <option value="">Escolha</option>
                      <optgroup label="Alto Tietê">
                        {alto.map((r) => (
                          <option key={r.slug} value={r.slug}>
                            {r.nome}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Zona Leste de São Paulo">
                        {leste.map((r) => (
                          <option key={r.slug} value={r.slug}>
                            {r.nome}
                          </option>
                        ))}
                      </optgroup>
                    </Select>
                  </Field>
                  <Field id={`${pre}-bairro`} label="Bairro (opcional)">
                    <Select
                      id={`${pre}-bairro`}
                      name="local_bairro"
                      value={l.bairro}
                      disabled={!bairros.length}
                      onChange={(e) => alterarLocal(l.chave, { bairro: e.target.value })}
                    >
                      <option value="">{regiao && !bairros.length ? "Sem bairros cadastrados" : "Não informar"}</option>
                      {bairros.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.nome}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field id={`${pre}-endereco`} label="Endereço (opcional)" hint="Rua e número. Aparece no perfil, com link para o mapa.">
                  <Input
                    {...fieldProps(`${pre}-endereco`, { hint: "sim" })}
                    name="local_endereco"
                    maxLength={200}
                    autoComplete="street-address"
                    value={l.endereco}
                    onChange={(e) => alterarLocal(l.chave, { endereco: e.target.value })}
                  />
                </Field>
                {locais.length > 1 && (
                  <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() => setLocais((ls) => ls.filter((x) => x.chave !== l.chave))}
                  >
                    <Icon icon={Trash2} />
                    Remover este local
                  </Button>
                )}
              </fieldset>
            );
          })}
          {erros.locais && <ErroCampo className="mt-0">{erros.locais}</ErroCampo>}
          {locais.length < 10 && (
            <Button
              variant="secondary"
              onClick={() =>
                setLocais((ls) => [...ls, { ...LOCAL_VAZIO, chave: Math.max(-1, ...ls.map((x) => x.chave)) + 1 }])
              }
            >
              <Icon icon={Plus} />
              Adicionar outro local
            </Button>
          )}
        </div>

        <div hidden={!sel.modos.includes("domiciliar")}>
          <Opcoes
            legenda="Onde faz atendimento em casa"
            campo="cobertura"
            erro={erros.cobertura}
            grupos={[
              { rotulo: "Alto Tietê", itens: alto },
              { rotulo: "Zona Leste de São Paulo", itens: leste },
            ]}
            marcados={v.cobertura}
          />
        </div>

        <Opcoes legenda="Disponibilidade (opcional)" campo="disp" itens={[...DISPONIBILIDADE_PERFIL]} marcados={v.disp} />
      </Bloco>

      <Bloco titulo="Animais e áreas">
        <Opcoes
          legenda="Espécies que atende"
          campo="especies"
          erro={erros.especies}
          itens={catalogos.especies.map((e) => ({ ...e, nome: e.slug === "exoticos" ? "Exóticos" : e.nome }))}
          marcados={v.especies}
        />
        <Opcoes legenda="Áreas de atuação (opcional)" campo="areas" itens={catalogos.areas} marcados={v.areas} />
        {areasEscolhidas.length > 1 && (
          <Field id={`${id}-area_principal`} label="Área principal" hint="Aparece em destaque no seu perfil.">
            <Select
              {...fieldProps(`${id}-area_principal`, { hint: "sim" })}
              name="area_principal"
              defaultValue={v.area_principal}
            >
              {areasEscolhidas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.nome}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </Bloco>

      <Bloco titulo="Serviços e preços">
        <fieldset aria-describedby={erros.consulta ? `${id}-consulta-erro` : undefined}>
          <legend className="mb-2 text-small font-medium text-text">Consulta (opcional)</legend>
          <FaixaPreco
            nome="consulta_"
            idBase={`${id}-consulta`}
            min={v.consulta_min}
            max={v.consulta_max}
            invalido={Boolean(erros.consulta)}
            dataCampo="consulta"
          />
          {erros.consulta && (
            <ErroCampo id={`${id}-consulta-erro`}>{erros.consulta}</ErroCampo>
          )}
        </fieldset>
        <Opcoes legenda="Serviços que oferece (opcional)" campo="servicos" itens={catalogos.servicos} marcados={v.servicos} />
        <div hidden={!sel.servicos.length} className="space-y-3">
          <p className="text-small text-text-muted">Preço de cada serviço (opcional): de quanto até quanto.</p>
          {catalogos.servicos.map((s) => (
            <fieldset key={s.slug} hidden={!sel.servicos.includes(s.slug)}>
              <legend className="mb-1.5 text-small font-medium text-text">{s.nome}</legend>
              <FaixaPreco
                nome={`servico_`}
                sufixo={`.${s.slug}`}
                idBase={`${id}-servico-${s.slug}`}
                min={v.servico_min[s.slug] ?? ""}
                max={v.servico_max[s.slug] ?? ""}
                invalido={false}
              />
            </fieldset>
          ))}
          {erros.servicos && <ErroCampo className="mt-0">{erros.servicos}</ErroCampo>}
        </div>
      </Bloco>

      <Bloco titulo="Pagamento">
        <Opcoes legenda="Formas de pagamento (opcional)" campo="pagamentos" itens={catalogos.pagamentos} marcados={v.pagamentos} />
        <div hidden={!sel.pagamentos.includes("parcelamento")} className="max-w-48">
          <Field id={`${id}-parcelas_max`} label="Parcelas, no máximo" error={erros.parcelas_max}>
            <Input
              {...campo("parcelas_max")}
              name="parcelas_max"
              inputMode="numeric"
              maxLength={2}
              placeholder="Ex.: 6"
              defaultValue={v.parcelas_max}
            />
          </Field>
        </div>
      </Bloco>

      <Bloco titulo="Sobre você">
        <Field
          id={`${id}-bio`}
          label="Apresentação (opcional)"
          error={erros.bio}
          hint={`${bio} de ${BIO_MAX} caracteres. Conte sua formação, seu jeito de atender e o que mais gosta de tratar.`}
        >
          <textarea
            {...campo("bio", "sim")}
            name="bio"
            rows={6}
            maxLength={BIO_MAX + 200}
            defaultValue={v.bio}
            onInput={(e) => setBio(e.currentTarget.value.trim().length)}
            className="block min-h-11 w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-body text-text placeholder:text-text-muted focus-visible:border-primary aria-invalid:border-error"
          />
        </Field>
        <div className="max-w-48">
          <Field id={`${id}-anos_experiencia`} label="Anos de experiência (opcional)" error={erros.anos_experiencia}>
            <Input
              {...campo("anos_experiencia")}
              name="anos_experiencia"
              inputMode="numeric"
              maxLength={2}
              defaultValue={v.anos_experiencia}
            />
          </Field>
        </div>
      </Bloco>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-border bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        {resumoErro && !enviando && <ResumoErro novo={novo}>{resumoErro}</ResumoErro>}
        <Button type="submit" size="lg" block disabled={enviando}>
          {enviando ? "Salvando..." : novo ? "Publicar perfil" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

// Repete o problema junto ao botão: no celular a barra fixa fica longe do campo.
function ResumoErro({ novo, children }: { novo: boolean; children: ReactNode }) {
  return (
    <p className="mb-3 flex gap-1.5 text-small text-error-strong">
      <Icon icon={CircleAlert} size="sm" className="mt-0.5" />
      <span className="min-w-0">
        <span className="font-semibold">{novo ? "Perfil não publicado." : "Alterações não salvas."}</span> {children}
      </span>
    </p>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card as="section" padding="lg" className="space-y-6">
      <h2 className="text-h3 text-text">{titulo}</h2>
      {children}
    </Card>
  );
}

function FaixaPreco({
  nome,
  sufixo = "",
  idBase,
  min,
  max,
  invalido,
  dataCampo,
}: {
  nome: string;
  sufixo?: string;
  idBase: string;
  min: string;
  max: string;
  invalido: boolean;
  dataCampo?: string;
}) {
  return (
    <div className="grid max-w-sm grid-cols-2 gap-3">
      {(["min", "max"] as const).map((lado) => (
        <div key={lado}>
          <label htmlFor={`${idBase}-${lado}`} className="mb-1 block text-caption text-text-muted">
            {lado === "min" ? "De (R$)" : "Até (R$)"}
          </label>
          <Input
            id={`${idBase}-${lado}`}
            name={`${nome}${lado}${sufixo}`}
            inputMode="decimal"
            maxLength={10}
            placeholder={lado === "min" ? "150" : "220"}
            defaultValue={lado === "min" ? min : max}
            aria-invalid={invalido || undefined}
            data-campo={lado === "min" ? dataCampo : undefined}
          />
        </div>
      ))}
    </div>
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
  campo: string;
  erro?: string;
  itens?: readonly ItemOpcao[];
  grupos?: { rotulo: string; itens: ItemOpcao[] }[];
  marcados?: string[];
}) {
  const erroId = useId();
  const blocos = grupos ?? [{ rotulo: "", itens: itens ?? [] }];
  const primeiro = blocos[0]?.itens[0]?.slug;
  return (
    <fieldset aria-describedby={erro ? erroId : undefined}>
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
        <ErroCampo id={erroId}>{erro}</ErroCampo>
      )}
    </fieldset>
  );
}
