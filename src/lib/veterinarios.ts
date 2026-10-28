import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Filtros } from "@/lib/filtros";

export const POR_PAGINA = 12;

// Tag de todos os dados de veterinários em cache; invalidada quando um perfil é publicado.
export const TAG_VETERINARIOS = "veterinarios";

const SELECT_VET = `
  id, slug, nome_exibicao, crmv_numero, crmv_uf, crmv_verificado, bio, foto_url,
  whatsapp, instagram, anos_experiencia, consulta_preco_min, consulta_preco_max,
  atende_emergencia, atende_fim_de_semana, atende_noturno, is_demo,
  veterinarian_species(species(slug, nome, ordem)),
  veterinarian_specialties(principal, specialties(slug, nome, ordem)),
  veterinarian_services(preco_min, preco_max, services(slug, nome, ordem)),
  veterinarian_payment_methods(parcelas_max, payment_methods(slug, nome, ordem)),
  veterinarian_attendance_modes(attendance_modes(slug, nome, ordem)),
  veterinarian_coverage_regions(regions(slug, nome)),
  clinics(id, nome, endereco, lat, lng,
    regions!clinics_region_id_fkey(slug, nome),
    neighborhoods!clinics_neighborhood_fk(slug, nome))
` as const;

type Item = { slug: string; nome: string };

export type Veterinario = {
  id: string;
  slug: string;
  nome: string;
  crmv: string;
  crmvVerificado: boolean;
  bio: string | null;
  fotoUrl: string | null;
  whatsapp: string | null;
  instagram: string | null;
  anosExperiencia: number | null;
  consulta: { min: number | null; max: number | null };
  emergencia: boolean;
  fimDeSemana: boolean;
  noturno: boolean;
  isDemo: boolean;
  especies: Item[];
  areas: (Item & { principal: boolean })[];
  servicos: (Item & { min: number | null; max: number | null })[];
  pagamentos: (Item & { parcelasMax: number | null })[];
  modos: Item[];
  cobertura: Item[];
  locais: {
    id: string;
    nome: string;
    endereco: string | null;
    lat: number | null;
    lng: number | null;
    regiao: Item;
    bairro: Item | null;
  }[];
};

function consultaVets() {
  return createPublicClient().from("veterinarians").select(SELECT_VET);
}

type Linha = NonNullable<Awaited<ReturnType<typeof consultaVets>>["data"]>[number];

const porOrdem = <T extends { ordem: number }>(a: T, b: T) => a.ordem - b.ordem;
const semOrdem = <T extends { ordem: number }>(item: T): Omit<T, "ordem"> => {
  const resto: Omit<T, "ordem"> & { ordem?: number } = { ...item };
  delete resto.ordem;
  return resto;
};

function mapear(v: Linha): Veterinario {
  return {
    id: v.id,
    slug: v.slug,
    nome: v.nome_exibicao,
    crmv: `CRMV-${v.crmv_uf} ${v.crmv_numero}`,
    crmvVerificado: v.crmv_verificado,
    bio: v.bio,
    fotoUrl: v.foto_url,
    whatsapp: v.whatsapp,
    instagram: v.instagram,
    anosExperiencia: v.anos_experiencia,
    consulta: { min: v.consulta_preco_min, max: v.consulta_preco_max },
    emergencia: v.atende_emergencia,
    fimDeSemana: v.atende_fim_de_semana,
    noturno: v.atende_noturno,
    isDemo: v.is_demo,
    especies: v.veterinarian_species.map((x) => x.species).sort(porOrdem).map(semOrdem),
    areas: v.veterinarian_specialties
      .map((x) => ({ ...x.specialties, principal: x.principal }))
      .sort((a, b) => Number(b.principal) - Number(a.principal) || a.ordem - b.ordem)
      .map(semOrdem),
    servicos: v.veterinarian_services
      .map((x) => ({ ...x.services, min: x.preco_min, max: x.preco_max }))
      .sort(porOrdem)
      .map(semOrdem),
    pagamentos: v.veterinarian_payment_methods
      .map((x) => ({ ...x.payment_methods, parcelasMax: x.parcelas_max }))
      .sort(porOrdem)
      .map(semOrdem),
    modos: v.veterinarian_attendance_modes.map((x) => x.attendance_modes).sort(porOrdem).map(semOrdem),
    cobertura: v.veterinarian_coverage_regions
      .map((x) => x.regions)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    locais: v.clinics.map((c) => ({
      id: c.id,
      nome: c.nome,
      endereco: c.endereco,
      lat: c.lat,
      lng: c.lng,
      regiao: c.regions,
      bairro: c.neighborhoods,
    })),
  };
}

function argsRpc(f: Filtros) {
  return {
    p_regiao: f.local,
    p_bairro: f.bairro,
    p_especie: f.especie,
    p_area: f.area,
    p_servico: f.servico,
    p_modos: f.modo,
    p_pagamentos: f.pagamento,
    p_emergencia: f.disp.includes("emergencia"),
    p_fim_de_semana: f.disp.includes("fim-de-semana"),
    p_noturno: f.disp.includes("noturno"),
    p_preco_max: f.preco,
  };
}

async function rpcBusca(f: Filtros, limite: number, offset: number) {
  const { data, error } = await createPublicClient().rpc("buscar_veterinarios", {
    ...argsRpc(f),
    p_limite: limite,
    p_offset: offset,
  });
  if (error) throw new Error(`Falha na busca: ${error.message}`);
  return data as { total: number; ids: string[] };
}

export async function buscarVeterinarios(f: Filtros, pagina: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_VETERINARIOS);

  const { total, ids } = await rpcBusca(f, POR_PAGINA, (pagina - 1) * POR_PAGINA);
  if (!ids.length) return { total, vets: [] };

  const { data, error } = await consultaVets().in("id", ids);
  if (error) throw new Error(`Falha ao carregar veterinários: ${error.message}`);
  const porId = new Map(data.map((v) => [v.id, mapear(v)]));
  return { total, vets: ids.flatMap((id) => porId.get(id) ?? []) };
}

export async function contarVeterinarios(f: Filtros) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_VETERINARIOS);
  return (await rpcBusca(f, 0, 0)).total;
}

export async function getVeterinario(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_VETERINARIOS);

  const { data, error } = await consultaVets().eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Falha ao carregar perfil: ${error.message}`);
  return data ? mapear(data) : null;
}
