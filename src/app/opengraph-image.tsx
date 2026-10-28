import { ImageResponse } from "next/og";
import { CORES } from "@/lib/tokens";

export const alt = "VetMeet: veterinários no Alto Tietê e na Zona Leste de São Paulo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem padrão de compartilhamento (WhatsApp, redes sociais), herdada por todas as páginas.
// Usa a fonte padrão do gerador: para usar Plus Jakarta Sans aqui seria preciso
// versionar os arquivos .ttf da fonte.
export default function Imagem() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: CORES.primary,
          color: CORES.white,
        }}
      >
        <div style={{ fontSize: 44, letterSpacing: -1 }}>VetMeet</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            Encontre um veterinário perto de você
          </div>
          <div style={{ fontSize: 34, color: CORES.primarySoft, maxWidth: 980 }}>
            Clínicas, atendimento em casa e teleorientação no Alto Tietê e na Zona Leste de São Paulo
          </div>
        </div>
      </div>
    ),
    size,
  );
}
