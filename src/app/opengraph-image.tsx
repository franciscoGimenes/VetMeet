import { ImageResponse } from "next/og";

export const alt = "VetMeet: veterinários no Alto Tietê e na Zona Leste de São Paulo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem padrão de compartilhamento (WhatsApp, redes sociais), herdada por todas as páginas.
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
          background: "#0f766e",
          color: "white",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>VetMeet</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            Encontre um veterinário perto de você
          </div>
          <div style={{ fontSize: 34, color: "#ccfbf1", maxWidth: 980 }}>
            Clínicas, atendimento em casa e teleorientação no Alto Tietê e na Zona Leste de São Paulo
          </div>
        </div>
      </div>
    ),
    size,
  );
}
