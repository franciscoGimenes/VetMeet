// Cliques de contato por dia: uma série, uma cor (token chart, validado), sem
// legenda. Cada coluna inteira é a área de hover/foco da barra; os valores
// também ficam numa tabela para leitores de tela e para conferência.

type Dia = { dia: string; total: number; whatsapp: number; demo: number };

const dataCurta = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export function GraficoCliques({ dias }: { dias: Dia[] }) {
  const max = Math.max(1, ...dias.map((d) => d.total));
  const n = dias.length;
  const marcasX = [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <figure>
      <div className="relative">
        {/* grade recessiva: topo (máximo) e base */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border" />
        <span className="absolute -top-2.5 right-0 bg-surface pl-1 text-caption text-text-muted tabular-nums">{max}</span>

        <div
          className="flex h-44 items-end gap-0.5 border-b border-border-strong"
          role="img"
          aria-label={`Cliques de contato por dia, de ${dataCurta(dias[0].dia)} a ${dataCurta(dias[n - 1].dia)}`}
        >
          {dias.map((d, i) => {
            const alinhamento =
              i < n * 0.2 ? "left-0" : i > n * 0.8 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              <div
                key={d.dia}
                tabIndex={0}
                aria-label={`${dataCurta(d.dia)}: ${d.total} cliques`}
                className="group relative flex h-full min-w-0 flex-1 items-end outline-none"
              >
                <div
                  className="w-full rounded-t-mark bg-chart group-hover:bg-primary-hover group-focus-visible:bg-primary-hover"
                  style={{ height: d.total ? `${(d.total / max) * 100}%` : 0 }}
                />
                <div
                  className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max rounded-control bg-text px-2.5 py-1.5 text-caption text-white shadow-overlay group-hover:block group-focus-visible:block ${alinhamento}`}
                >
                  <strong className="text-small font-semibold tabular-nums">{d.total}</strong> cliques · {dataCurta(d.dia)}
                  <div className="text-border-strong">
                    {d.whatsapp} WhatsApp{d.demo ? ` · ${d.demo} em demo` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mt-1.5 h-4 text-caption text-text-muted">
          {marcasX.map((i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${((i + 0.5) / n) * 100}%`,
                transform: i === 0 ? "translateX(-25%)" : i === n - 1 ? "translateX(-75%)" : "translateX(-50%)",
              }}
            >
              {dataCurta(dias[i].dia)}
            </span>
          ))}
        </div>
      </div>

      <details className="mt-3 text-small">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-text-muted hover:text-text">Ver como tabela</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left tabular-nums">
            <thead className="text-caption text-text-muted">
              <tr>
                <th className="py-1 font-medium">Dia</th>
                <th className="py-1 text-right font-medium">Cliques</th>
                <th className="py-1 text-right font-medium">WhatsApp</th>
                <th className="py-1 text-right font-medium">Em demo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...dias].reverse().map((d) => (
                <tr key={d.dia}>
                  <td className="py-1">{dataCurta(d.dia)}</td>
                  <td className="py-1 text-right">{d.total}</td>
                  <td className="py-1 text-right">{d.whatsapp}</td>
                  <td className="py-1 text-right">{d.demo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
