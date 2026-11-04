import { iniciais } from "@/lib/formato";

const TAMANHOS = {
  xs: "size-9 text-caption font-semibold",
  sm: "size-11 text-small font-semibold",
  md: "size-14 text-h3",
  lg: "size-20 text-h2 sm:size-24",
};

export function Avatar({
  nome,
  fotoUrl,
  tamanho = "md",
  className = "",
}: {
  nome: string;
  fotoUrl: string | null;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}) {
  const classes = `${TAMANHOS[tamanho]} shrink-0 rounded-pill ${className}`;
  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- fotos virão de fontes variadas no MVP
    return <img src={fotoUrl} alt="" className={`${classes} object-cover`} />;
  }
  return (
    <div aria-hidden="true" className={`${classes} grid place-items-center bg-primary-soft text-primary`}>
      {iniciais(nome)}
    </div>
  );
}
