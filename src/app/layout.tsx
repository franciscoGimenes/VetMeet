import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Rodape } from "@/components/Rodape";
import { ButtonLink } from "@/components/ui";
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
            <Link href="/" className="inline-flex min-h-11 items-center text-h3 text-primary">
              VetMeet
            </Link>
            <nav className="flex items-center gap-2">
              <ButtonLink href="/buscar" variant="ghost">
                <span className="sm:hidden">Buscar</span>
                <span className="hidden sm:inline">Buscar veterinários</span>
              </ButtonLink>
              <ButtonLink href="/sou-veterinario" variant="secondary">
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
