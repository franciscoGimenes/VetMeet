import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Rodape } from "@/components/Rodape";
import { Search } from "lucide-react";
import { ButtonLink, Icon } from "@/components/ui";
import { SITE_DESCRICAO, SITE_NOME, SITE_URL } from "@/lib/site";
import { CORES } from "@/lib/tokens";
import "./globals.css";

// Fontes servidas pelo próprio site (next/font), sem link externo.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VetMeet: veterinários no Alto Tietê e Zona Leste",
    template: "%s | VetMeet",
  },
  description: SITE_DESCRICAO,
  applicationName: SITE_NOME,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NOME,
    title: "VetMeet: veterinários no Alto Tietê e Zona Leste",
    description: SITE_DESCRICAO,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: CORES.background,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
            <Link href="/" className="inline-flex min-h-11 shrink-0 items-center">
              <Logo compacto />
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              {/* Abaixo de 420px só o ícone (com rótulo para leitor de tela): os três links cabem. */}
              <ButtonLink href="/buscar" variant="ghost" className="px-3 sm:px-4">
                <Icon icon={Search} className="min-[420px]:hidden" />
                <span className="sr-only min-[420px]:not-sr-only sm:hidden">Buscar</span>
                <span className="hidden sm:inline">Buscar veterinários</span>
              </ButtonLink>
              <ButtonLink href="/rede" variant="ghost" className="px-3 sm:px-4">
                Rede
              </ButtonLink>
              <ButtonLink href="/sou-veterinario" variant="secondary" className="px-3 sm:px-4">
                Sou veterinário
              </ButtonLink>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
