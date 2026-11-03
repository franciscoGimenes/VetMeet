import Image from "next/image";
import horizontal from "../../public/brand/logo-horizontal.svg";
import simbolo from "../../public/brand/logo-simbolo.svg";

// Logotipo da marca (arquivos em public/brand, gerados com o texto já em paths).
// `compacto`: só o símbolo abaixo de 420px de largura, onde o nome inteiro não
// cabe ao lado dos botões do cabeçalho; o nome continua no alt e no título da página.
export function Logo({ compacto = false, className = "h-8" }: { compacto?: boolean; className?: string }) {
  if (!compacto) {
    return <Image src={horizontal} alt="VetMeet" unoptimized className={`${className} w-auto`} />;
  }
  return (
    <>
      <Image src={simbolo} alt="VetMeet" unoptimized className={`${className} w-auto min-[420px]:hidden`} />
      <Image src={horizontal} alt="VetMeet" unoptimized className={`${className} hidden w-auto min-[420px]:block`} />
    </>
  );
}
