import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VetMeet: veterinários no Alto Tietê e Zona Leste",
    template: "%s | VetMeet",
  },
  description:
    "Encontre médicos-veterinários com clínica própria, atendimento em casa ou teleorientação no Alto Tietê e na Zona Leste de São Paulo.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-lg font-bold tracking-tight text-marca-800">
              VetMeet
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
              <Link href="/buscar" className="text-slate-700 hover:text-slate-900">
                <span className="sm:hidden">Buscar</span>
                <span className="hidden sm:inline">Buscar veterinários</span>
              </Link>
              <Link
                href="/sou-veterinario"
                className="rounded-lg border border-marca-700 px-3 py-1.5 text-marca-800 hover:bg-marca-50"
              >
                Sou veterinário
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
