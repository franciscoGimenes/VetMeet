import Image from "next/image";
import horizontal from "../../public/brand/logo-horizontal.svg";
import negativo from "../../public/brand/logo-negativo.svg";
import simbolo from "../../public/brand/logo-simbolo.svg";

// Logotipo da marca (arquivos em public/brand, gerados com o texto já em paths).
// `compacto`: só o símbolo abaixo de 420px de largura, onde o nome inteiro não
// cabe ao lado dos botões do cabeçalho; o nome continua no alt e no título da página.
// `negativo`: versão clara, para fundo primary-dark.
export function Logo({
  compacto = false,
  negativo: escuro = false,
  className = "h-8",
}: {
  compacto?: boolean;
  negativo?: boolean;
  className?: string;
}) {
  const completo = escuro ? negativo : horizontal;
  if (!compacto) {
    return <Image src={completo} alt="VetMeet" unoptimized className={`${className} w-auto`} />;
  }
  return (
    <>
      <Image src={simbolo} alt="VetMeet" unoptimized className={`${className} w-auto min-[420px]:hidden`} />
      <Image src={completo} alt="VetMeet" unoptimized className={`${className} hidden w-auto min-[420px]:block`} />
    </>
  );
}
