import { iniciais } from "@/lib/formato";

const TAMANHOS = {
  md: "size-14 text-lg",
  lg: "size-20 text-2xl sm:size-24 sm:text-3xl",
};

export function Avatar({
  nome,
  fotoUrl,
  tamanho = "md",
}: {
  nome: string;
  fotoUrl: string | null;
  tamanho?: keyof typeof TAMANHOS;
}) {
  const classes = `${TAMANHOS[tamanho]} shrink-0 rounded-full`;
  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- fotos virão de fontes variadas no MVP
    return <img src={fotoUrl} alt="" className={`${classes} object-cover`} />;
  }
  return (
    <div
      aria-hidden="true"
      className={`${classes} grid place-items-center bg-marca-100 font-semibold text-marca-800`}
    >
      {iniciais(nome)}
    </div>
  );
}
