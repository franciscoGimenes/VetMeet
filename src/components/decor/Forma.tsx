import { cn } from "@/lib/cn";

// Formas orgânicas de fundo (decoração pura). A cor vem de `className` (text-*),
// a posição e o tamanho também; o pai precisa de `relative overflow-hidden`.
const FORMAS = {
  a: "M422 63c55 49 72 139 47 214s-92 136-171 157-170 2-225-53S-1 236 13 160 101 21 180 5s187 9 242 58Z",
  b: "M398 96c46 58 52 150 9 214s-133 100-215 88S38 330 13 252 7 87 76 37 352 38 398 96Z",
  c: "M441 129c32 72 3 167-60 222S219 432 143 409 3 314 1 232 49 70 125 29s284 28 316 100Z",
} as const;

export function Forma({ variante = "a", className }: { variante?: keyof typeof FORMAS; className?: string }) {
  return (
    <svg
      viewBox="0 0 480 440"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute fill-current", className)}
    >
      <path d={FORMAS[variante]} />
    </svg>
  );
}
