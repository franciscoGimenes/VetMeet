import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu perfil",
  robots: { index: false, follow: false },
};

export default function LayoutConta({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16 sm:px-6 lg:pt-10">{children}</div>;
}
